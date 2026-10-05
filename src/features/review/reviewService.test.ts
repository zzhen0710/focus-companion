import { describe, expect, it } from 'vitest'
import { createReviewService } from './reviewService'
import { createTaskService } from '../tasks/taskService'
import { createTimerController } from '../focus/timerController'
import { createDefaultData } from '../../storage/storage'
import type { AppData } from '../../storage/storage'
import { createLocalStorageAdapter } from '../../storage/localStorageAdapter'
import { reviewQueue, reviewSummary } from '../../domain/dailyReview'
import type { TaskInput } from '../../domain/task'

const input: TaskInput = { title: 'Read', content: null, categoryId: null, schedule: { kind: 'date', date: '2026-10-04', timeRange: null } }
function fixture() {
  let raw = JSON.stringify(createDefaultData()), fail = false, now = new Date(2026, 9, 6, 12).getTime(), seq = 0
  const id = () => `id-${++seq}`
  const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { if (fail) throw Error('Quota'); raw = value } }))
  const tasks = createTaskService(storage, () => now, id, id)
  const review = () => createReviewService(storage, () => now, id)
  return { tasks, review, storage, timer: createTimerController(storage, () => now, id),
    stored: () => JSON.parse(raw) as AppData, fail: (value: boolean) => { fail = value }, at: (value: number) => { now = value } }
}
function add(f: ReturnType<typeof fixture>, title = 'Read') {
  const result = f.tasks.create({ ...input, title }); if (!result.ok) throw Error(result.message); return result.id
}
describe('resumable Daily Review', () => {
  it('atomically completes, moves, drops and derives only real linked counts', () => {
    const f = fixture(), a = add(f), b = add(f, 'Move'), c = add(f, 'Drop')
    const r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    expect(draft.taskIds).toEqual([a, b, c])
    expect(r.resolve(draft.id, a, { type: 'complete' })).toBe(true)
    expect(r.resolve(draft.id, b, { type: 'move', schedule: { kind: 'date', date: '2026-10-06', timeRange: null } })).toBe(true)
    expect(r.resolve(draft.id, c, { type: 'drop' })).toBe(true)
    const data = f.stored()
    expect(data.activeReview).toBeNull(); expect(data.reviews).toHaveLength(1)
    expect(reviewSummary(data.taskEvents, draft.id)).toEqual({ reviewed: 3, completed: 1, moved: 1, dropped: 1 })
    expect(data.tasks.map((task) => task.status)).toEqual(['completed', 'open', 'dropped'])
    expect(data.tasks[0].completedAt).toBe(new Date(2026, 9, 6, 12).getTime())
    expect(r.getSnapshot().summary?.id).toBe(draft.id)
    expect(r.resolve(draft.id, a, { type: 'complete' })).toBe(false)
    expect(f.stored().taskEvents).toHaveLength(3)
  })
  it('rejects invalid, unchanged and still-overdue schedules and allows explicit Unscheduled', () => {
    const f = fixture(), a = add(f), r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    for (const schedule of [input.schedule, { kind: 'date' as const, date: '2026-10-05', timeRange: null },
      { kind: 'date' as const, date: '2026-02-29', timeRange: null }]) {
      expect(r.resolve(draft.id, a, { type: 'move', schedule })).toBe(false)
      expect(f.stored().taskEvents).toEqual([])
    }
    expect(r.resolve(draft.id, a, { type: 'move', schedule: { kind: 'unscheduled' } })).toBe(true)
    expect(f.stored().taskEvents[0]).toMatchObject({ type: 'taskRescheduled', previousSchedule: input.schedule,
      taskSnapshot: { schedule: { kind: 'unscheduled' } } })
  })
  it('dismisses without resolving, resumes after reload, and does not grow an active cohort', () => {
    const f = fixture(), a = add(f), r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    r.dismiss(); r.reload()
    expect(r.getSnapshot().visible).toBe(false)
    expect(f.stored().activeReview).toEqual(draft)
    const b = add(f, 'New overdue'); r.reload()
    expect(f.stored().activeReview?.taskIds).toEqual([a])
    const cold = f.review(); cold.enter()
    expect(cold.getSnapshot().visible).toBe(true)
    expect(f.stored().activeReview?.id).toBe(draft.id)
    cold.resolve(draft.id, a, { type: 'drop' })
    cold.open()
    expect(f.stored().activeReview?.taskIds).toEqual([b])
  })
  it('skips outside resolutions without fake review actions and cancels an untouched empty draft', () => {
    const f = fixture(), a = add(f), r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    f.tasks.setCompleted(a, true); r.reload()
    expect(f.stored().activeReview).toBeNull(); expect(f.stored().reviews).toEqual([])
    expect(f.stored().taskEvents[0].reviewId).toBeNull()
    expect(reviewSummary(f.stored().taskEvents, draft.id).reviewed).toBe(0)
  })
  it('finishes a real review when remaining work is deleted outside it, preserving history', () => {
    const f = fixture(), a = add(f), b = add(f, 'Other'), r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    r.resolve(draft.id, a, { type: 'complete' }); f.tasks.delete(b); r.reload()
    expect(f.stored().reviews).toHaveLength(1)
    expect(reviewSummary(f.stored().taskEvents, draft.id)).toEqual({ reviewed: 1, completed: 1, moved: 0, dropped: 0 })
    const events = f.stored().taskEvents, reviews = f.stored().reviews
    f.tasks.delete(a)
    expect(f.stored().taskEvents).toEqual(events); expect(f.stored().reviews).toEqual(reviews)
  })
  it('preserves draft/task/history on failed actions and retries once without duplicates', () => {
    const f = fixture(), a = add(f), r = f.review(); r.enter()
    const before = f.stored(), draft = before.activeReview!
    f.fail(true)
    expect(r.resolve(draft.id, a, { type: 'drop' })).toBe(false)
    expect(f.stored()).toEqual(before)
    expect(r.getSnapshot().error).not.toBeNull()
    f.fail(false); r.reload()
    expect(r.resolve(draft.id, a, { type: 'drop' })).toBe(true)
    expect(r.resolve(draft.id, a, { type: 'drop' })).toBe(false)
    expect(f.stored().taskEvents).toHaveLength(1); expect(f.stored().reviews).toHaveLength(1)
  })
  it('refreshes date eligibility without reopening a dismissed panel, and preserves live timer data', () => {
    const f = fixture(), a = add(f), r = f.review(); r.enter(); r.dismiss()
    f.timer.start(a)
    const timer = f.stored().timer
    r.resolve(f.stored().activeReview!.id, a, { type: 'complete' })
    expect(f.stored().timer).toEqual(timer)
    f.at(new Date(2026, 9, 7, 12).getTime()); r.reload()
    expect(r.getSnapshot().visible).toBe(false)
    f.timer.checkpoint()
    expect(f.stored().reviews).toHaveLength(1); expect(f.stored().taskEvents).toHaveLength(1)
  })
  it('removes externally moved/dropped/deleted tasks from the queue', () => {
    for (const action of ['move', 'drop', 'delete']) {
      const f = fixture(), a = add(f), r = f.review(); r.enter()
      if (action === 'move') f.tasks.update(a, { ...input, schedule: { kind: 'unscheduled' } })
      if (action === 'drop') f.tasks.drop(a)
      if (action === 'delete') f.tasks.delete(a)
      r.reload()
      expect(f.stored().activeReview).toBeNull(); expect(f.stored().reviews).toEqual([])
    }
  })
  it('excludes already acted-on tasks if reopened during the same review', () => {
    const f = fixture(), a = add(f), b = add(f, 'Other'), r = f.review(); r.enter()
    const draft = f.stored().activeReview!
    r.resolve(draft.id, a, { type: 'complete' }); f.tasks.setCompleted(a, false)
    expect(reviewQueue(f.stored().tasks, f.stored().taskEvents, draft, r.getSnapshot().today).map((task) => task.id)).toEqual([b])
  })
})

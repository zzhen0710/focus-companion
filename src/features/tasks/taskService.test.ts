import { describe, expect, it } from 'vitest'
import type { TaskInput } from '../../domain/task'
import { createLocalStorageAdapter } from '../../storage/localStorageAdapter'
import { createDefaultData } from '../../storage/storage'
import type { AppData } from '../../storage/storage'
import { createTimerController } from '../focus/timerController'
import { createTaskService } from './taskService'

const input: TaskInput = { title: 'Read', content: null, categoryId: null, schedule: { kind: 'unscheduled' } }
function fixture() {
  const data = createDefaultData()
  data.settings.focusDurationSeconds = 2
  data.settings.shortBreakDurationSeconds = 1
  data.categories = [{ id: 'category', name: 'Reading', createdAt: 0 }]
  let raw = JSON.stringify(data)
  let fail = false
  let now = 1000
  let id = 0
  const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => {
    if (fail) throw new Error('Quota')
    raw = value
  } }))
  const tasks = createTaskService(storage, () => now, () => `task-${++id}`)
  const timer = createTimerController(storage, () => now, () => 'focus')
  return { tasks, timer, storage, recover: () => createTimerController(storage, () => now), at: (n: number) => { now = n }, fail: (v: boolean) => { fail = v },
    stored: () => JSON.parse(raw) as AppData, replace: (data: AppData) => { raw = JSON.stringify(data) } }
}

describe('Tasks local application service', () => {
  it('enforces strict lifecycle, idempotency and immutable history while allowing closed-task editing', () => {
    const f = fixture(); f.tasks.create(input)
    f.tasks.setCompleted('task-1', true)
    const completedEvents = f.stored().taskEvents
    expect(f.tasks.drop('task-1').ok).toBe(false)
    f.tasks.setCompleted('task-1', true)
    expect(f.stored().taskEvents).toEqual(completedEvents)
    f.tasks.update('task-1', { ...input, title: 'Corrected', content: 'notes' })
    expect(f.stored().tasks[0].status).toBe('completed')
    expect(f.stored().taskEvents).toEqual(completedEvents)
    f.tasks.setCompleted('task-1', false); f.tasks.drop('task-1')
    expect(f.tasks.setCompleted('task-1', true).ok).toBe(false)
    f.tasks.drop('task-1')
    f.tasks.update('task-1', { ...input, title: 'Dropped correction' })
    expect(f.stored().tasks[0].status).toBe('dropped')
    f.tasks.setCompleted('task-1', false); f.tasks.setCompleted('task-1', false)
    expect(f.stored().taskEvents.map((event) => event.type)).toEqual(['taskCompleted', 'taskReopened', 'taskDropped', 'taskReopened'])
    expect(f.stored().taskEvents[0].taskSnapshot.title).toBe('Read')
    const events = f.stored().taskEvents
    f.tasks.delete('task-1')
    expect(f.stored().taskEvents).toEqual(events)
  })
  it('records genuine reschedules only, retaining old/new snapshots after later edits', () => {
    const f = fixture(); f.tasks.create(input)
    const changed: TaskInput = { ...input, schedule: { kind: 'date', date: '2026-10-06', timeRange: null } }
    f.tasks.update('task-1', changed); f.tasks.update('task-1', changed)
    f.tasks.move('task-1', 'up'); f.tasks.update('task-1', { ...changed, title: 'New title', categoryId: 'category' })
    expect(f.stored().taskEvents).toHaveLength(1)
    expect(f.stored().taskEvents[0]).toMatchObject({ type: 'taskRescheduled', previousSchedule: input.schedule,
      taskSnapshot: { title: 'Read', schedule: changed.schedule }, reviewId: null })
    f.tasks.drop('task-1')
    expect(f.timer.start('task-1')).toBe(false)
  })
  it.each(['completed', 'interrupted'])('keeps the Start-time title and references for %s Focus after task corrections', (outcome) => {
    const f = fixture(); f.tasks.create({ ...input, categoryId: 'category' }); f.timer.start('task-1')
    f.tasks.update('task-1', { ...input, title: 'Renamed', categoryId: null })
    f.tasks.drop('task-1')
    f.at(outcome === 'completed' ? 3000 : 2500)
    if (outcome === 'completed') f.timer.tick(); else f.timer.reset()
    expect(f.stored().sessions[0]).toMatchObject({ outcome, taskTitleSnapshot: 'Read', taskId: 'task-1', categoryId: 'category' })
    const sessions = f.stored().sessions
    f.tasks.delete('task-1')
    expect(f.stored().sessions).toEqual(sessions)
  })
  it.each(['running', 'paused'] as const)('returns actionable deletion feedback for a %s target without changing data', (status) => {
    const f = fixture()
    f.tasks.create(input)
    f.timer.start('task-1')
    if (status === 'paused') f.timer.pause()
    const before = f.stored()
    const snapshot = f.tasks.getSnapshot()
    expect(f.tasks.delete('task-1')).toEqual({
      ok: false,
      message: 'This task belongs to an unfinished Focus period. Finish or reset that period before deleting it.',
    })
    expect(f.stored()).toEqual(before)
    expect(f.tasks.getSnapshot()).toBe(snapshot)
    f.timer.reset()
    expect(f.tasks.delete('task-1').ok).toBe(true)
    expect(f.stored().tasks).toEqual([])
    expect(f.stored().sessions).toEqual(before.sessions)
  })

  it('creates, edits completed tasks, reschedules, reopens, and preserves completion facts', () => {
    const f = fixture()
    expect(f.tasks.create({ ...input, title: '  Read  ' })).toEqual({ ok: true, id: 'task-1' })
    f.at(2000)
    f.tasks.setCompleted('task-1', true)
    f.at(3000)
    f.tasks.setCompleted('task-1', true)
    const edit: TaskInput = { ...input, title: 'Corrected', content: 'notes', schedule: { kind: 'date', date: '2026-10-06', timeRange: null } }
    expect(f.tasks.update('task-1', edit).ok).toBe(true)
    expect(f.stored().tasks[0]).toMatchObject({ id: 'task-1', createdAt: 1000, status: 'completed', droppedAt: null, completedAt: 2000, ...edit })
    f.tasks.setCompleted('task-1', false)
    expect(f.stored().tasks[0].completedAt).toBeNull()
    expect(createTaskService(f.storage).getSnapshot().data?.tasks).toEqual(f.stored().tasks)
  })
  it('persists array ordering deterministically and rejects missing/invalid operations', () => {
    const f = fixture()
    f.tasks.create(input); f.tasks.create({ ...input, title: 'Second' })
    f.tasks.move('task-2', 'up')
    expect(f.stored().tasks.map((task) => task.id)).toEqual(['task-2', 'task-1'])
    f.tasks.move('task-2', 'up')
    f.tasks.move('task-2', 'down')
    expect(f.stored().tasks.map((task) => task.id)).toEqual(['task-1', 'task-2'])
    const before = f.stored()
    expect(f.tasks.create({ ...input, title: ' ' }).ok).toBe(false)
    expect(f.tasks.update('absent', input).ok).toBe(false)
    expect(f.tasks.setCompleted('absent', true).ok).toBe(false)
    expect(f.tasks.delete('absent').ok).toBe(false)
    expect(f.tasks.move('absent', 'up').ok).toBe(false)
    expect(f.tasks.create({ ...input, categoryId: 'missing' }).ok).toBe(false)
    expect(f.stored()).toEqual(before)
  })
  it('never publishes successful mutations when storage writes fail', () => {
    const f = fixture()
    f.tasks.create(input)
    const before = f.stored()
    f.fail(true)
    for (const action of [() => f.tasks.create(input), () => f.tasks.update('task-1', { ...input, title: 'Lost' }),
      () => f.tasks.setCompleted('task-1', true), () => f.tasks.delete('task-1'), () => f.tasks.move('task-1', 'up')]) expect(action().ok).toBe(false)
    expect(f.stored()).toEqual(before)
    expect(f.tasks.getSnapshot().data).toEqual(before)
    expect(f.tasks.getSnapshot().error).not.toBeNull()
    f.fail(false); f.tasks.reload()
    expect(f.tasks.update('task-1', { ...input, title: 'Saved' }).ok).toBe(true)
  })
  it('captures targets, protects deletion, and preserves them through task edits and conservative recovery', () => {
    const f = fixture()
    f.tasks.create({ ...input, categoryId: 'category' })
    expect(f.timer.start('task-1')).toBe(true)
    f.at(1500); f.timer.pause()
    expect(f.tasks.delete('task-1').ok).toBe(false)
    f.tasks.update('task-1', { ...input, title: 'Edited', categoryId: null })
    f.tasks.setCompleted('task-1', true)
    expect(f.stored().timer).toMatchObject({ status: 'paused', taskId: 'task-1', categoryId: 'category' })
    f.timer.resume(); f.timer.checkpoint()
    f.at(100000)
    const restored = f.recover()
    expect(restored.getSnapshot().data?.timer).toMatchObject({ status: 'paused', taskId: 'task-1', categoryId: 'category' })
    expect(f.stored().sessions).toEqual([])
    restored.resume()
    f.at(101500); restored.tick()
    expect(f.stored().sessions).toHaveLength(1)
    expect(f.stored().sessions[0]).toMatchObject({ taskId: 'task-1', categoryId: 'category' })
    restored.reset()
    expect(f.stored().sessions).toHaveLength(1)
  })
  it('writes captured references on natural completion and keeps historical records after deletion', () => {
    const f = fixture()
    f.tasks.create({ ...input, categoryId: 'category' })
    f.timer.start('task-1')
    f.at(1500); f.timer.pause(); f.timer.resume()
    f.tasks.update('task-1', input)
    f.tasks.setCompleted('task-1', true)
    f.at(3000); f.timer.tick()
    const sessions = f.stored().sessions
    expect(sessions[0]).toMatchObject({ taskId: 'task-1', categoryId: 'category' })
    expect(f.tasks.delete('task-1').ok).toBe(true)
    expect(f.stored().sessions).toEqual(sessions)
  })
  it('rejects stale task selection, clears break targets, and resets a subsecond Focus without a record', () => {
    const f = fixture()
    f.tasks.create(input); f.tasks.setCompleted('task-1', true)
    expect(f.timer.start('task-1')).toBe(false)
    expect(f.timer.start('missing')).toBe(false)
    f.timer.selectMode('shortBreak'); f.timer.start('missing')
    expect(f.stored().timer).toMatchObject({ taskId: null, categoryId: null })
    f.at(2000); f.timer.tick()
    expect(f.stored().sessions).toEqual([])
    f.timer.selectMode('focus'); f.tasks.setCompleted('task-1', false); f.timer.start('task-1'); f.timer.reset()
    expect(f.stored().sessions).toEqual([])
    expect(f.tasks.delete('task-1').ok).toBe(true)
  })
  it('preserves both services data through checkpoints, failed completion, and retry', () => {
    const f = fixture()
    f.tasks.create(input); f.timer.start('task-1')
    f.at(1500); f.timer.checkpoint()
    const timer = f.stored().timer
    f.tasks.update('task-1', { ...input, content: 'Keep me' })
    expect(f.stored().timer).toEqual(timer)
    f.at(3000); f.fail(true); f.timer.tick()
    f.fail(false); f.tasks.create({ ...input, title: 'Second' })
    f.timer.retry(); f.timer.retry()
    expect(f.stored().tasks).toHaveLength(2)
    expect(f.stored().tasks[0].content).toBe('Keep me')
    expect(f.stored().sessions).toHaveLength(1)
    f.tasks.move('task-2', 'up')
    expect(f.stored().sessions).toHaveLength(1)
    expect(f.stored().categories).toEqual([{ id: 'category', name: 'Reading', createdAt: 0 }])
    expect(f.stored().settings.focusDurationSeconds).toBe(2)
  })
  it('tolerates unchanged unresolved legacy category references', () => {
    const f = fixture()
    f.tasks.create(input)
    const data = f.stored(); data.tasks[0].categoryId = 'gone'; f.replace(data)
    expect(f.tasks.update('task-1', { ...input, categoryId: 'gone' }).ok).toBe(true)
  })
  it.each(['{bad', JSON.stringify({ schemaVersion: 99 })])('protects invalid/unsupported data %s', (raw) => {
    let writes = 0
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { writes++ } }))
    const service = createTaskService(storage)
    expect(service.create(input).ok).toBe(false)
    expect(writes).toBe(0)
  })
})

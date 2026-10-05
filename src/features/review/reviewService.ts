import type { AppData, AppStorage } from '../../storage/storage'
import type { ReviewRecord } from '../../domain/dailyReview'
import { isReviewEligible, reviewQueue, settleReview } from '../../domain/dailyReview'
import { localCalendarDate, isTaskSchedule } from '../../domain/taskSchedule'
import type { TaskSchedule } from '../../domain/taskSchedule'
import { sameSchedule } from '../../domain/taskEvent'
import { changeTask } from '../tasks/taskMutations'

export type ReviewAction = { type: 'complete' | 'drop' } | { type: 'move'; schedule: TaskSchedule }
export function createReviewService(storage: AppStorage, clock: () => number = Date.now,
  createId: () => string = () => crypto.randomUUID()) {
  let snapshot: { data: AppData | null; error: string | null; visible: boolean; summary: ReviewRecord | null; today: string } =
    { data: null, error: null, visible: false, summary: null, today: localCalendarDate(clock()) }
  const listeners = new Set<() => void>()
  function publish(data: AppData | null, error: string | null = null) {
    const previous = snapshot.data?.activeReview
    const finished = previous && !data?.activeReview ? data?.reviews.find((review) => review.id === previous.id) : null
    snapshot = { ...snapshot, data, error, today: localCalendarDate(clock()), summary: finished ?? snapshot.summary }
    listeners.forEach((listener) => listener())
  }
  function read(): AppData | null {
    const loaded = storage.load()
    if (loaded.status !== 'ready' || loaded.needsMigration) {
      publish(snapshot.data, 'Review could not be loaded. Stored data was left untouched. Retry before resolving tasks.')
      return null
    }
    return loaded.data
  }
  function save(data: AppData): boolean {
    if (storage.save(data).status !== 'saved') {
      publish(snapshot.data, 'Review changes could not be saved. Your previous data and pending work remain. Retry, then try again.')
      return false
    }
    publish(data)
    return true
  }
  function reload() {
    const data = read()
    if (!data) return
    const next = settleReview(data, localCalendarDate(clock()), clock())
    if (next !== data) save(next)
    else publish(data)
  }
  function open() {
    const data = read()
    if (!data) return false
    const now = clock(), today = localCalendarDate(now)
    let next = settleReview(data, today, now)
    if (!next.activeReview) {
      const pending = next.tasks.filter((task) => isReviewEligible(task, today))
      if (pending.length) {
        const id = createId()
        if (next.reviews.some((review) => review.id === id) || next.taskEvents.some((event) => event.reviewId === id)) {
          publish(snapshot.data, 'Review ID conflict. Please retry.')
          return false
        }
        next = { ...next, activeReview: { id, startedAt: now, localDate: today, taskIds: pending.map((task) => task.id) } }
      }
    }
    if (next !== data && !save(next)) return false
    snapshot = { ...snapshot, visible: true, summary: next.activeReview ? null : snapshot.summary }
    publish(next)
    return true
  }
  // Construction is read-only; app entry waits for safe timer bootstrap before settling a draft.
  const initial = read()
  if (initial) publish(initial)
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    reload, open,
    enter() {
      reload()
      if (snapshot.data?.tasks.some((task) => isReviewEligible(task, snapshot.today))) open()
    },
    dismiss() { snapshot = { ...snapshot, visible: false }; listeners.forEach((listener) => listener()) },
    resolve(reviewId: string, taskId: string, action: ReviewAction): boolean {
      const data = read()
      if (!data) return false
      const now = clock(), today = localCalendarDate(now)
      if (!data.activeReview || data.activeReview.id !== reviewId) { publish(data, 'This review is no longer active. Reload the queue.'); return false }
      const task = reviewQueue(data.tasks, data.taskEvents, data.activeReview, today).find((task) => task.id === taskId)
      if (!task) { reload(); return false }
      if (action.type === 'move' && (!isTaskSchedule(action.schedule) || sameSchedule(task.schedule, action.schedule) ||
        isReviewEligible({ ...task, schedule: action.schedule }, today))) {
        publish(data, 'Choose a changed valid schedule that is no longer overdue, or explicitly choose Unscheduled.')
        return false
      }
      const change = action.type === 'move' ? { type: 'update' as const,
        input: { title: task.title, content: task.content, categoryId: task.categoryId, schedule: action.schedule } } : action
      const next = changeTask(data, taskId, change, now, createId, reviewId)
      if (typeof next === 'string') { publish(data, next); return false }
      return save(settleReview(next, today, now))
    },
  }
}

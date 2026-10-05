import type { Task } from './task'
import type { TaskEvent } from './taskEvent'
import { isCalendarDate } from './taskSchedule'

export interface ReviewDraft { id: string; startedAt: number; localDate: string; taskIds: string[] }
export interface ReviewRecord extends ReviewDraft { completedAt: number }
export function isReviewEligible(task: Task, today: string): boolean {
  if (!isCalendarDate(today)) throw new Error('Invalid local date')
  return task.status === 'open' && (task.schedule.kind === 'date' ? task.schedule.date < today
    : task.schedule.kind === 'dateRange' && task.schedule.endDate < today)
}
export function reviewQueue(tasks: Task[], events: TaskEvent[], draft: ReviewDraft, today: string): Task[] {
  const resolved = new Set(events.filter((event) => event.reviewId === draft.id).map((event) => event.taskId))
  return tasks.filter((task) => draft.taskIds.includes(task.id) && !resolved.has(task.id) && isReviewEligible(task, today))
}
export function reviewSummary(events: TaskEvent[], reviewId: string) {
  const linked = events.filter((event) => event.reviewId === reviewId)
  return { reviewed: new Set(linked.map((event) => event.taskId)).size,
    completed: linked.filter((event) => event.type === 'taskCompleted').length,
    moved: linked.filter((event) => event.type === 'taskRescheduled').length,
    dropped: linked.filter((event) => event.type === 'taskDropped').length }
}
interface ReviewData { tasks: Task[]; taskEvents: TaskEvent[]; activeReview: ReviewDraft | null; reviews: ReviewRecord[] }
/** Only real linked actions make a completed Review; an empty untouched draft is cancelled. */
export function settleReview<T extends ReviewData>(data: T, today: string, now: number): T {
  const draft = data.activeReview
  if (!draft || reviewQueue(data.tasks, data.taskEvents, draft, today).length) return data
  const record = { ...draft, completedAt: Math.max(draft.startedAt, now) }
  return { ...data, activeReview: null, reviews: reviewSummary(data.taskEvents, draft.id).reviewed > 0 &&
    !data.reviews.some((review) => review.id === draft.id) ? [...data.reviews, record] : data.reviews }
}

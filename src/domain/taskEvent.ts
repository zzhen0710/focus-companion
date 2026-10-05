import type { Task } from './task'
import type { TaskSchedule } from './taskSchedule'

interface EventContext {
  id: string
  taskId: string
  categoryId: string | null
  occurredAt: number
  taskSnapshot: { title: string; schedule: TaskSchedule }
  reviewId: string | null
}
export type TaskEvent = EventContext & (
  | { type: 'taskCompleted' | 'taskDropped' }
  | { type: 'taskReopened'; previousStatus: 'completed' | 'dropped' }
  | { type: 'taskRescheduled'; previousSchedule: TaskSchedule }
)
export function eventContext(task: Task, id: string, now: number, reviewId: string | null = null): EventContext {
  return { id, taskId: task.id, categoryId: task.categoryId, occurredAt: now,
    taskSnapshot: { title: task.title, schedule: structuredClone(task.schedule) }, reviewId }
}
export function sameSchedule(a: TaskSchedule, b: TaskSchedule): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'unscheduled') return true
  if (a.kind === 'dateRange' && b.kind === 'dateRange') return a.startDate === b.startDate && a.endDate === b.endDate
  return a.kind === 'date' && b.kind === 'date' && a.date === b.date &&
    a.timeRange?.start === b.timeRange?.start && a.timeRange?.end === b.timeRange?.end
}

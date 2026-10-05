import { isTaskSchedule } from './taskSchedule'
import type { TaskSchedule } from './taskSchedule'

export interface Task {
  id: string
  title: string
  content: string | null
  schedule: TaskSchedule
  categoryId: string | null
  status: 'open' | 'completed' | 'dropped'
  /** Unix timestamp in milliseconds. */
  createdAt: number
  completedAt: number | null
  droppedAt: number | null
}

export type TaskInput = Pick<Task, 'title' | 'content' | 'schedule' | 'categoryId'>

export function normalizeTaskInput(input: TaskInput): TaskInput | null {
  if (typeof input.title !== 'string' || !input.title.trim() ||
    (input.content !== null && typeof input.content !== 'string') || !isTaskSchedule(input.schedule) ||
    (input.categoryId !== null && (typeof input.categoryId !== 'string' || !input.categoryId.trim()))) return null
  return { title: input.title.trim(), content: input.content?.trim() ? input.content : null,
    categoryId: input.categoryId, schedule: structuredClone(input.schedule) }
}

export function transitionTask(task: Task, action: 'complete' | 'drop' | 'reopen', now: number): Task | string {
  const status = action === 'complete' ? 'completed' : action === 'drop' ? 'dropped' : 'open'
  if (task.status === status) return task
  if (action !== 'reopen' && task.status !== 'open') return 'Reopen this task before choosing another outcome.'
  return { ...task, status, completedAt: status === 'completed' ? now : null, droppedAt: status === 'dropped' ? now : null }
}

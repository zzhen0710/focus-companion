import { isTaskSchedule } from './taskSchedule'
import type { TaskSchedule } from './taskSchedule'

export interface Task {
  id: string
  title: string
  content: string | null
  schedule: TaskSchedule
  categoryId: string | null
  completed: boolean
  /** Unix timestamp in milliseconds. */
  createdAt: number
  completedAt: number | null
}

export type TaskInput = Pick<Task, 'title' | 'content' | 'schedule' | 'categoryId'>

export function normalizeTaskInput(input: TaskInput): TaskInput | null {
  if (typeof input.title !== 'string' || !input.title.trim() ||
    (input.content !== null && typeof input.content !== 'string') || !isTaskSchedule(input.schedule) ||
    (input.categoryId !== null && (typeof input.categoryId !== 'string' || !input.categoryId.trim()))) return null
  return { title: input.title.trim(), content: input.content?.trim() ? input.content : null,
    categoryId: input.categoryId, schedule: structuredClone(input.schedule) }
}

export function setTaskCompleted(task: Task, completed: boolean, now: number): Task {
  if (task.completed === completed) return task
  return { ...task, completed, completedAt: completed ? now : null }
}

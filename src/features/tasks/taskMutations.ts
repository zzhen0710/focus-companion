import { normalizeTaskInput, transitionTask } from '../../domain/task'
import type { TaskInput } from '../../domain/task'
import { eventContext, sameSchedule } from '../../domain/taskEvent'
import type { TaskEvent } from '../../domain/taskEvent'
import type { AppData } from '../../storage/storage'

export type TaskChange = { type: 'update'; input: TaskInput } | { type: 'complete' | 'drop' | 'reopen' }
export function validateTaskInput(input: TaskInput, data: AppData, originalCategory?: string | null): TaskInput | string {
  const normalized = normalizeTaskInput(input)
  if (!normalized) return 'Enter a title and a valid schedule. Ranges need both endpoints in order; overnight times are not supported.'
  if (normalized.categoryId !== null && normalized.categoryId !== originalCategory &&
    !data.categories.some((category) => category.id === normalized.categoryId)) return 'The selected category is unavailable.'
  return normalized
}
/** Prepare a single document change; callers own loading and atomic persistence. */
export function changeTask(data: AppData, id: string, action: TaskChange, now: number, createId: () => string,
  reviewId: string | null = null): AppData | string {
  const task = data.tasks.find((task) => task.id === id)
  if (!task) return 'Task not found. Reload the list.'
  let next = task
  let event: TaskEvent | null = null
  if (action.type === 'update') {
    const fields = validateTaskInput(action.input, data, task.categoryId)
    if (typeof fields === 'string') return fields
    next = { ...task, ...fields }
    if (!sameSchedule(task.schedule, fields.schedule)) event = {
      ...eventContext(next, createId(), now, reviewId), type: 'taskRescheduled', previousSchedule: structuredClone(task.schedule),
    }
  } else {
    const result = transitionTask(task, action.type, now)
    if (typeof result === 'string') return result
    if (result === task) return data
    next = result
    const context = eventContext(next, createId(), now, reviewId)
    event = action.type === 'reopen'
      ? { ...context, type: 'taskReopened', previousStatus: task.status as 'completed' | 'dropped' }
      : { ...context, type: action.type === 'complete' ? 'taskCompleted' : 'taskDropped' }
  }
  if (event && data.taskEvents.some((item) => item.id === event.id)) return 'History ID conflict. Please retry.'
  return { ...data, tasks: data.tasks.map((item) => item.id === id ? next : item),
    taskEvents: event ? [...data.taskEvents, event] : data.taskEvents }
}

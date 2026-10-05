import type { Task, TaskInput } from '../../domain/task'
import { addCalendarDays } from '../../domain/taskSchedule'
import type { TaskSchedule } from '../../domain/taskSchedule'
import type { TaskResult, TaskService } from './taskService'

export function duplicateTasks(tasks: Task[], title: string): Task[] {
  const normalized = title.trim()
  return normalized ? tasks.filter((task) => task.status === 'open' && task.title.trim() === normalized) : []
}

export function duplicateSchedule(schedule: TaskSchedule, today: string): string {
  const day = (date: string) => date === today ? 'Today' : date === addCalendarDays(today, 1) ? 'Tomorrow'
    : date === addCalendarDays(today, -1) ? 'Yesterday' : date
  if (schedule.kind === 'unscheduled') return 'Unscheduled'
  if (schedule.kind === 'dateRange') return `${day(schedule.startDate)} – ${day(schedule.endDate)}`
  return day(schedule.date) + (schedule.timeRange ? `, ${schedule.timeRange.start}–${schedule.timeRange.end}` : '')
}

// Prefer the closest scheduled date/range; ties retain the existing manual order.
export function duplicateContext(matches: Task[], today: string): string {
  const distance = (task: Task) => {
    const schedule = task.schedule
    if (schedule.kind === 'unscheduled') return Infinity
    const start = schedule.kind === 'date' ? schedule.date : schedule.startDate
    const end = schedule.kind === 'date' ? schedule.date : schedule.endDate
    const nearest = today < start ? start : today > end ? end : today
    return Math.abs(Date.parse(`${nearest}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`))
  }
  const nearest = matches.reduce((best, task) => distance(task) < distance(best) ? task : best)
  const schedule = duplicateSchedule(nearest.schedule, today)
  return matches.length === 1 ? schedule : `${matches.length} tasks with this title · Nearest: ${schedule}`
}

export type SaveAttempt = TaskResult | { confirmation: true; matches: Task[] }
/** Advisory creation guard only; persistence and validation stay in the Task service. */
export function saveTaskDraft(task: Task | null, input: TaskInput, service?: TaskService,
  onSave?: (input: TaskInput) => TaskResult, createAnyway = false): SaveAttempt {
  if (!task && !createAnyway && service) {
    const matches = duplicateTasks(service.getSnapshot().data?.tasks ?? [], input.title)
    if (matches.length) return { confirmation: true, matches }
  }
  return onSave ? onSave(input) : service ? (task ? service.update(task.id, input) : service.create(input))
    : { ok: false, message: 'Task changes are unavailable.' }
}

import type { Task, TaskInput } from '../../domain/task'
import type { TaskSchedule } from '../../domain/taskSchedule'

export interface TaskFormDraft {
  title: string; content: string; categoryId: string; kind: TaskSchedule['kind']
  date: string; startTime: string; endTime: string; startDate: string; endDate: string
}
export function taskFormDraft(task: Task | null): TaskFormDraft {
  const schedule = task?.schedule ?? { kind: 'unscheduled' }
  return { title: task?.title ?? '', content: task?.content ?? '', categoryId: task?.categoryId ?? '', kind: schedule.kind,
    date: schedule.kind === 'date' ? schedule.date : '',
    startTime: schedule.kind === 'date' ? schedule.timeRange?.start ?? '' : '',
    endTime: schedule.kind === 'date' ? schedule.timeRange?.end ?? '' : '',
    startDate: schedule.kind === 'dateRange' ? schedule.startDate : '', endDate: schedule.kind === 'dateRange' ? schedule.endDate : '' }
}
export function taskDraftInput(draft: TaskFormDraft): TaskInput {
  const { kind, date, startTime, endTime, startDate, endDate } = draft
  const schedule: TaskSchedule = kind === 'unscheduled' ? { kind } : kind === 'dateRange' ? { kind, startDate, endDate }
    : { kind, date, timeRange: startTime || endTime ? { start: startTime, end: endTime } : null }
  return { title: draft.title, content: draft.content, categoryId: draft.categoryId || null, schedule }
}

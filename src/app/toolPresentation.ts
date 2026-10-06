import type { Task } from '../domain/task'
import type { Settings } from '../domain/settings'
import type { TaskFormDraft } from '../features/tasks/taskFormDraft'
import { taskFormDraft } from '../features/tasks/taskFormDraft'

export interface TaskEditor { task: Task | null; draft: TaskFormDraft; instance: number; formView: 'details' | 'content' | 'schedule' }
export type DurationDraft = Record<'focusDurationSeconds' | 'shortBreakDurationSeconds' | 'longBreakDurationSeconds', string>
export function durationDraft(settings: Settings): DurationDraft {
  return { focusDurationSeconds: String(settings.focusDurationSeconds / 60),
    shortBreakDurationSeconds: String(settings.shortBreakDurationSeconds / 60),
    longBreakDurationSeconds: String(settings.longBreakDurationSeconds / 60) }
}
let editorInstance = 0 // Transient form identity, unrelated to durable Task IDs.
export function openTaskEditor(task: Task | null): TaskEditor { return { task, draft: taskFormDraft(task), instance: ++editorInstance, formView: 'details' } }
export function editorConflict(editor: TaskEditor | null, tasks: readonly Task[]): string | null {
  return editor?.task && !tasks.some((task) => task.id === editor.task!.id)
    ? 'This task is no longer available. Your draft is kept; cancel when ready.' : null
}

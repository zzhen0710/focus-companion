import { elapsedMs } from './timer'
import type { TimerState } from './timer'

/** An immutable completed or explicitly interrupted Focus record. */
export interface FocusSession {
  id: string
  taskId: string | null
  categoryId: string | null
  /** Unix timestamps in milliseconds. */
  startedAt: number
  endedAt: number
  durationSeconds: number
  plannedDurationSeconds: number
  outcome: 'completed' | 'interrupted'
  taskTitleSnapshot: string | null
}

export function focusRecord(timer: TimerState, now: number): FocusSession | null {
  if (timer.status === 'idle' || timer.mode !== 'focus') return null
  const completed = timer.status === 'completed'
  const durationSeconds = completed ? timer.durationMs / 1000 : Math.floor(elapsedMs(timer, now) / 1000)
  if (!completed && durationSeconds < 1) return null
  return { id: timer.id, taskId: timer.taskId, categoryId: timer.categoryId,
    taskTitleSnapshot: timer.taskTitleSnapshot, startedAt: timer.startedAt,
    endedAt: completed ? timer.endedAt : Math.max(timer.startedAt, now),
    plannedDurationSeconds: timer.durationMs / 1000, durationSeconds,
    outcome: completed ? 'completed' : 'interrupted' }
}

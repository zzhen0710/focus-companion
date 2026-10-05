import type { Category } from '../domain/category'
import type { FocusSession } from '../domain/focusSession'
import type { Settings } from '../domain/settings'
import type { Task } from '../domain/task'
import type { TimerState } from '../domain/timer'
import type { TaskEvent } from '../domain/taskEvent'
import type { ReviewDraft, ReviewRecord } from '../domain/dailyReview'

export interface AppData {
  schemaVersion: 4
  tasks: Task[]
  categories: Category[]
  sessions: FocusSession[]
  settings: Settings
  timer: TimerState
  taskEvents: TaskEvent[]
  activeReview: ReviewDraft | null
  reviews: ReviewRecord[]
}

export type V3Task = Omit<Task, 'status' | 'droppedAt'> & { completed: boolean }
export type LegacyTask = Omit<V3Task, 'content' | 'schedule'>
type LegacyTimer = { status: 'idle'; mode: TimerState['mode'] } |
  Omit<Extract<TimerState, { status: 'running' }>, 'taskId' | 'categoryId' | 'taskTitleSnapshot'> |
  Omit<Extract<TimerState, { status: 'paused' }>, 'taskId' | 'categoryId' | 'taskTitleSnapshot'> |
  Omit<Extract<TimerState, { status: 'completed' }>, 'taskId' | 'categoryId' | 'taskTitleSnapshot'>
export type LegacySession = Omit<FocusSession, 'outcome' | 'plannedDurationSeconds' | 'taskTitleSnapshot'>
export type LegacyAppData = Omit<AppData, 'schemaVersion' | 'timer' | 'tasks' | 'sessions' | 'taskEvents' | 'activeReview' | 'reviews'> &
  { schemaVersion: 1; tasks: LegacyTask[]; sessions: LegacySession[] }
export type V2AppData = Omit<LegacyAppData, 'schemaVersion'> & { schemaVersion: 2; timer: LegacyTimer }
type V3Timer = { status: 'idle'; mode: TimerState['mode'] } |
  Omit<Extract<TimerState, { status: 'running' }>, 'taskTitleSnapshot'> |
  Omit<Extract<TimerState, { status: 'paused' }>, 'taskTitleSnapshot'> |
  Omit<Extract<TimerState, { status: 'completed' }>, 'taskTitleSnapshot'>
export type V3AppData = Omit<V2AppData, 'schemaVersion' | 'tasks' | 'timer'> & { schemaVersion: 3; tasks: V3Task[]; timer: V3Timer }

export type LoadResult =
  | { status: 'ready'; data: AppData; needsMigration?: boolean }
  | { status: 'missing' }
  | { status: 'invalid' | 'unsupported' | 'unavailable' }

export type SaveResult = { status: 'saved' | 'blocked' | 'unavailable' }

export interface AppStorage {
  load(): LoadResult
  save(data: AppData): SaveResult
}

export function createDefaultData(): AppData {
  return {
    schemaVersion: 4,
    taskEvents: [], activeReview: null, reviews: [],
    timer: { status: 'idle', mode: 'focus' },
    tasks: [],
    categories: [],
    sessions: [],
    settings: {
      focusDurationSeconds: 1500,
      shortBreakDurationSeconds: 300,
      longBreakDurationSeconds: 900,
    },
  }
}

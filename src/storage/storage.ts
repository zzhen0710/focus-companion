import type { Category } from '../domain/category'
import type { FocusSession } from '../domain/focusSession'
import type { Settings } from '../domain/settings'
import type { Task } from '../domain/task'
import type { TimerState } from '../domain/timer'

export interface AppData {
  schemaVersion: 2
  tasks: Task[]
  categories: Category[]
  sessions: FocusSession[]
  settings: Settings
  timer: TimerState
}

export type LegacyAppData = Omit<AppData, 'schemaVersion' | 'timer'> & { schemaVersion: 1 }

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
    schemaVersion: 2,
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

import type { Category } from '../domain/category'
import type { FocusSession } from '../domain/focusSession'
import type { Settings } from '../domain/settings'
import type { Task } from '../domain/task'

export interface AppData {
  schemaVersion: 1
  tasks: Task[]
  categories: Category[]
  sessions: FocusSession[]
  settings: Settings
}

export type LoadResult =
  | { status: 'ready'; data: AppData }
  | { status: 'missing' }
  | { status: 'invalid' | 'unsupported' | 'unavailable' }

export type SaveResult = { status: 'saved' | 'blocked' | 'unavailable' }

export interface AppStorage {
  load(): LoadResult
  save(data: AppData): SaveResult
}

export function createDefaultData(): AppData {
  return {
    schemaVersion: 1,
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

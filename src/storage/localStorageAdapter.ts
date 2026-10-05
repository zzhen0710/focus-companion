import type { AppData, AppStorage, LegacyAppData, LoadResult } from './storage'
import { isTimerState } from '../domain/timer'
import { migrateV1ToV2 } from './migrations'

export const STORAGE_KEY = 'focus-companion:data'

type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isReference(value: unknown): boolean {
  return value === null || isText(value)
}

function isNonnegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isStoredData(value: unknown): value is AppData | LegacyAppData {
  if (!isObject(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2)) return false
  if (value.schemaVersion === 2 && !isTimerState(value.timer)) return false
  const { tasks, categories, sessions, settings } = value
  return (
    Array.isArray(tasks) && tasks.every((task: unknown) =>
      isObject(task) && isText(task.id) && isText(task.title) &&
      isReference(task.categoryId) && typeof task.completed === 'boolean' &&
      isNonnegativeNumber(task.createdAt) &&
      (task.completedAt === null || isNonnegativeNumber(task.completedAt))) &&
    Array.isArray(categories) && categories.every((category: unknown) =>
      isObject(category) && isText(category.id) && isText(category.name) &&
      isNonnegativeNumber(category.createdAt)) &&
    Array.isArray(sessions) && sessions.every((session: unknown) =>
      isObject(session) && isText(session.id) && isReference(session.taskId) &&
      isReference(session.categoryId) && isNonnegativeNumber(session.startedAt) &&
      isNonnegativeNumber(session.endedAt) && session.endedAt >= session.startedAt &&
      isNonnegativeNumber(session.durationSeconds)) &&
    isObject(settings) &&
    isNonnegativeNumber(settings.focusDurationSeconds) && settings.focusDurationSeconds > 0 &&
    isNonnegativeNumber(settings.shortBreakDurationSeconds) && settings.shortBreakDurationSeconds > 0 &&
    isNonnegativeNumber(settings.longBreakDurationSeconds) && settings.longBreakDurationSeconds > 0
  )
}

export function createLocalStorageAdapter(
  getStorage: () => StorageAccess = () => window.localStorage,
): AppStorage {
  function load(): LoadResult {
    let raw: string | null
    try {
      raw = getStorage().getItem(STORAGE_KEY)
    } catch {
      return { status: 'unavailable' }
    }
    if (raw === null) return { status: 'missing' }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { status: 'invalid' }
    }
    if (isObject(parsed) && typeof parsed.schemaVersion === 'number' && parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) {
      return { status: 'unsupported' }
    }
    if (!isStoredData(parsed)) return { status: 'invalid' }
    return parsed.schemaVersion === 1
      ? { status: 'ready', data: migrateV1ToV2(parsed), needsMigration: true }
      : { status: 'ready', data: parsed }
  }

  return {
    load,
    save(data) {
      // Recheck existing data so a failed load can never trigger a destructive overwrite.
      const existing = load()
      if (existing.status === 'unavailable') return { status: 'unavailable' }
      if (existing.status === 'invalid' || existing.status === 'unsupported' || data.schemaVersion !== 2 || !isStoredData(data)) {
        return { status: 'blocked' }
      }
      try {
        getStorage().setItem(STORAGE_KEY, JSON.stringify(data))
        return { status: 'saved' }
      } catch {
        return { status: 'unavailable' }
      }
    },
  }
}

import type { AppData, AppStorage, LegacyAppData, V2AppData, LoadResult } from './storage'
import { isTaskSchedule } from '../domain/taskSchedule'
import { isTimerState } from '../domain/timer'
import { migrateV1ToV2, migrateV2ToV3 } from './migrations'

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

function isStoredData(value: unknown): value is AppData | LegacyAppData | V2AppData {
  if (!isObject(value) || typeof value.schemaVersion !== 'number' || ![1, 2, 3].includes(value.schemaVersion)) return false
  if (value.schemaVersion !== 1 && !isTimerState(value.timer, value.schemaVersion === 3)) return false
  const { tasks, categories, sessions, settings } = value
  return (
    Array.isArray(tasks) && tasks.every((task: unknown) =>
      isObject(task) && isText(task.id) && isText(task.title) &&
      (value.schemaVersion !== 3 || ((task.content === null || typeof task.content === 'string') && isTaskSchedule(task.schedule))) &&
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
    if (isObject(parsed) && typeof parsed.schemaVersion === 'number' && ![1, 2, 3].includes(parsed.schemaVersion)) {
      return { status: 'unsupported' }
    }
    if (!isStoredData(parsed)) return { status: 'invalid' }
    if (parsed.schemaVersion === 1) return { status: 'ready', data: migrateV2ToV3(migrateV1ToV2(parsed)), needsMigration: true }
    if (parsed.schemaVersion === 2) return { status: 'ready', data: migrateV2ToV3(parsed), needsMigration: true }
    return { status: 'ready', data: parsed }
  }

  return {
    load,
    save(data) {
      // Recheck existing data so a failed load can never trigger a destructive overwrite.
      const existing = load()
      if (existing.status === 'unavailable') return { status: 'unavailable' }
      if (existing.status === 'invalid' || existing.status === 'unsupported' || data.schemaVersion !== 3 || !isStoredData(data)) {
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

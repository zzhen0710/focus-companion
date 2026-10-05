import type { AppData, AppStorage, LegacyAppData, V2AppData, V3AppData, LoadResult } from './storage'
import { isTaskSchedule, isCalendarDate } from '../domain/taskSchedule'
import { isTimerState } from '../domain/timer'
import { migrateV1ToV2, migrateV2ToV3, migrateV3ToV4 } from './migrations'

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

function isReview(value: unknown, completed: boolean): boolean {
  return isObject(value) && isText(value.id) && isNonnegativeNumber(value.startedAt) && isCalendarDate(value.localDate) &&
    Array.isArray(value.taskIds) && value.taskIds.every(isText) && new Set(value.taskIds).size === value.taskIds.length &&
    (!completed || (isNonnegativeNumber(value.completedAt) && value.completedAt >= value.startedAt))
}
function isEvent(value: unknown): boolean {
  if (!isObject(value) || !isText(value.id) || !isText(value.taskId) || !isReference(value.categoryId) ||
    !isReference(value.reviewId) || !isNonnegativeNumber(value.occurredAt) || !isObject(value.taskSnapshot) ||
    !isText(value.taskSnapshot.title) || !isTaskSchedule(value.taskSnapshot.schedule)) return false
  if (value.type === 'taskRescheduled') return isTaskSchedule(value.previousSchedule)
  if (value.type === 'taskReopened') return value.reviewId === null && ['completed', 'dropped'].includes(String(value.previousStatus))
  return value.type === 'taskCompleted' || value.type === 'taskDropped'
}
function uniqueIds(records: unknown[]): boolean {
  return new Set(records.map((record) => (record as Record<string, unknown>).id)).size === records.length
}
function isStoredData(value: unknown): value is AppData | LegacyAppData | V2AppData | V3AppData {
  if (!isObject(value) || typeof value.schemaVersion !== 'number' || ![1, 2, 3, 4].includes(value.schemaVersion)) return false
  const current = value.schemaVersion === 4
  const version = value.schemaVersion
  if (value.schemaVersion !== 1 && !isTimerState(value.timer, value.schemaVersion >= 3, current)) return false
  if (current && (!Array.isArray(value.taskEvents) || !value.taskEvents.every(isEvent) ||
    !(value.activeReview === null || isReview(value.activeReview, false)) ||
    !Array.isArray(value.reviews) || !value.reviews.every((review) => isReview(review, true)))) return false
  if (current) {
    const events = value.taskEvents as Record<string, unknown>[]
    const reviews = value.reviews as Record<string, unknown>[]
    const draft = value.activeReview as Record<string, unknown> | null
    if (!uniqueIds(events) || !uniqueIds(reviews) || (draft && reviews.some((review) => review.id === draft.id))) return false
    const reviewedTasks = new Set<string>()
    for (const event of events) {
      if (event.reviewId === null) continue
      const review = draft?.id === event.reviewId ? draft : reviews.find((review) => review.id === event.reviewId)
      const key = JSON.stringify([event.reviewId, event.taskId])
      if (!review || !(review.taskIds as string[]).includes(event.taskId as string) || reviewedTasks.has(key)) return false
      reviewedTasks.add(key)
    }
  }
  const { tasks, categories, sessions, settings } = value
  return (
    Array.isArray(tasks) && tasks.every((task: unknown) =>
      isObject(task) && isText(task.id) && isText(task.title) &&
      (version < 3 || ((task.content === null || typeof task.content === 'string') && isTaskSchedule(task.schedule))) &&
      isReference(task.categoryId) && (current ? ['open', 'completed', 'dropped'].includes(String(task.status)) &&
        (task.status === 'dropped' ? isNonnegativeNumber(task.droppedAt) && task.completedAt === null
          : task.droppedAt === null) : typeof task.completed === 'boolean') &&
      isNonnegativeNumber(task.createdAt) &&
      (task.completedAt === null || isNonnegativeNumber(task.completedAt))) &&
    Array.isArray(categories) && categories.every((category: unknown) =>
      isObject(category) && isText(category.id) && isText(category.name) &&
      isNonnegativeNumber(category.createdAt)) &&
    Array.isArray(sessions) && sessions.every((session: unknown) =>
      isObject(session) && isText(session.id) && isReference(session.taskId) &&
      isReference(session.categoryId) && isNonnegativeNumber(session.startedAt) &&
      isNonnegativeNumber(session.endedAt) && session.endedAt >= session.startedAt &&
      isNonnegativeNumber(session.durationSeconds) && (!current ||
        (['completed', 'interrupted'].includes(String(session.outcome)) && isNonnegativeNumber(session.plannedDurationSeconds) &&
          session.durationSeconds <= session.plannedDurationSeconds &&
          (session.outcome !== 'interrupted' || (Number.isInteger(session.durationSeconds) && session.durationSeconds >= 1)) &&
          (session.taskTitleSnapshot === null || isText(session.taskTitleSnapshot))))) &&
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
    if (isObject(parsed) && typeof parsed.schemaVersion === 'number' && ![1, 2, 3, 4].includes(parsed.schemaVersion)) {
      return { status: 'unsupported' }
    }
    if (!isStoredData(parsed)) return { status: 'invalid' }
    if (parsed.schemaVersion === 1) return { status: 'ready', data: migrateV3ToV4(migrateV2ToV3(migrateV1ToV2(parsed))), needsMigration: true }
    if (parsed.schemaVersion === 2) return { status: 'ready', data: migrateV3ToV4(migrateV2ToV3(parsed)), needsMigration: true }
    if (parsed.schemaVersion === 3) return { status: 'ready', data: migrateV3ToV4(parsed), needsMigration: true }
    return { status: 'ready', data: parsed }
  }

  return {
    load,
    save(data) {
      // Recheck existing data so a failed load can never trigger a destructive overwrite.
      const existing = load()
      if (existing.status === 'unavailable') return { status: 'unavailable' }
      if (existing.status === 'invalid' || existing.status === 'unsupported' || data.schemaVersion !== 4 || !isStoredData(data)) {
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

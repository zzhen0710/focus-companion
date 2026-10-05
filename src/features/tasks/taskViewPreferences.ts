import type { Task } from '../../domain/task'
import { matchesCalendarQuery } from '../../domain/taskSchedule'

export type TaskView = 'all' | 'today' | 'unscheduled'
export type TaskStatusFilter = 'all' | Task['status']
export interface TaskWorkspace { view: TaskView; status: TaskStatusFilter }
export const TASK_VIEW_KEY = 'focus-companion:ui:task-view'
const defaults: TaskWorkspace = { view: 'all', status: 'open' }
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

function isWorkspace(value: unknown): value is TaskWorkspace {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const workspace = value as Record<string, unknown>
  return typeof workspace.view === 'string' && ['all', 'today', 'unscheduled'].includes(workspace.view) &&
    typeof workspace.status === 'string' && ['all', 'open', 'completed', 'dropped'].includes(workspace.status)
}

/** Presentation-only storage. It never reads or writes the durable application document. */
export function createTaskViewPreferences(getStorage: () => PreferenceStorage = () => window.localStorage) {
  let workspace = { ...defaults }
  try {
    const stored: unknown = JSON.parse(getStorage().getItem(TASK_VIEW_KEY) ?? 'null')
    if (isWorkspace(stored)) workspace = { view: stored.view, status: stored.status }
  } catch { /* Missing/unreadable preferences must not prevent application use. */ }
  let snapshot: TaskWorkspace & { error: string | null } = { ...workspace, error: null }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    set(change: Partial<TaskWorkspace>) {
      const next = { view: snapshot.view, status: snapshot.status, ...change }
      if (!isWorkspace(next)) return
      let error: string | null = null
      try { getStorage().setItem(TASK_VIEW_KEY, JSON.stringify(next)) }
      catch { error = 'View preference could not be saved. It will last while this page is open.' }
      snapshot = { ...next, error }
      listeners.forEach((listener) => listener())
    },
  }
}

// Survives route unmounts; a new document restores the independently saved selections.
export const taskViewPreferences = createTaskViewPreferences()

export function tasksInWorkspace(tasks: Task[], workspace: TaskWorkspace, today: string): Task[] {
  return tasks.filter((task) => matchesCalendarQuery(task.schedule, workspace.view, today) &&
    (workspace.status === 'all' || task.status === workspace.status))
}

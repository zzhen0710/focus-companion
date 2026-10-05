import type { TaskInput } from '../../domain/task'
import { settleReview } from '../../domain/dailyReview'
import { localCalendarDate } from '../../domain/taskSchedule'
import { changeTask, validateTaskInput } from './taskMutations'
import type { AppData, AppStorage } from '../../storage/storage'

export interface TaskSnapshot { data: AppData | null; error: string | null }
export type TaskResult = { ok: true; id: string } | { ok: false; message: string }

/** Local application API. Each operation merges into the latest stored document. */
export function createTaskService(storage: AppStorage, clock: () => number = Date.now, createId: () => string = () => crypto.randomUUID(),
  createEventId: () => string = () => crypto.randomUUID()) {
  let snapshot: TaskSnapshot = { data: null, error: null }
  const listeners = new Set<() => void>()
  function publish(data: AppData | null, error: string | null = null) {
    snapshot = { data, error }
    listeners.forEach((listener) => listener())
  }
  function read(): AppData | null {
    const loaded = storage.load()
    if (loaded.status !== 'ready' || loaded.needsMigration) {
      publish(snapshot.data, 'Tasks could not be loaded. Stored data was left untouched. Retry loading before making changes.')
      return null
    }
    return loaded.data
  }
  function failure(message: string): TaskResult { return { ok: false, message } }
  function mutate(id: string, change: (data: AppData) => AppData | string): TaskResult {
    const data = read()
    if (!data) return failure(snapshot.error!)
    const changed = change(data)
    if (typeof changed === 'string') return failure(changed)
    const next = settleReview(changed, localCalendarDate(clock()), clock())
    if (storage.save(next).status !== 'saved') {
      publish(snapshot.data, 'Task changes could not be saved. Your previous data is unchanged. Retry loading, then save again.')
      return failure(snapshot.error!)
    }
    publish(next)
    return { ok: true, id }
  }
  function reload() { const data = read(); if (data) publish(data) }
  reload()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    reload,
    create(input: TaskInput): TaskResult {
      const id = createId()
      return mutate(id, (data) => {
        const fields = validateTaskInput(input, data)
        if (typeof fields === 'string') return fields
        if (data.tasks.some((task) => task.id === id)) return 'A task with this ID already exists.'
        return { ...data, tasks: [...data.tasks, { ...fields, id, status: 'open', createdAt: clock(), completedAt: null, droppedAt: null }] }
      })
    },
    update(id: string, input: TaskInput): TaskResult {
      return mutate(id, (data) => changeTask(data, id, { type: 'update', input }, clock(), createEventId))
    },
    setCompleted(id: string, completed: boolean): TaskResult {
      return mutate(id, (data) => changeTask(data, id, { type: completed ? 'complete' : 'reopen' }, clock(), createEventId))
    },
    drop(id: string): TaskResult { return mutate(id, (data) => changeTask(data, id, { type: 'drop' }, clock(), createEventId)) },
    delete(id: string): TaskResult {
      return mutate(id, (data) => {
        if (!data.tasks.some((task) => task.id === id)) return 'Task not found. Reload the list.'
        if ((data.timer.status === 'running' || data.timer.status === 'paused') && data.timer.taskId === id)
          return 'This task belongs to an unfinished Focus period. Finish or reset that period before deleting it.'
        return { ...data, tasks: data.tasks.filter((task) => task.id !== id) }
      })
    },
    move(id: string, direction: 'up' | 'down'): TaskResult {
      return mutate(id, (data) => {
        const index = data.tasks.findIndex((task) => task.id === id)
        if (index < 0) return 'Task not found. Reload the list.'
        const target = index + (direction === 'up' ? -1 : 1)
        const tasks = [...data.tasks]
        if (target >= 0 && target < tasks.length) [tasks[index], tasks[target]] = [tasks[target], tasks[index]]
        return { ...data, tasks }
      })
    },
  }
}

export type TaskService = ReturnType<typeof createTaskService>

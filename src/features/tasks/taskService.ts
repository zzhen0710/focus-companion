import { normalizeTaskInput, setTaskCompleted } from '../../domain/task'
import type { Task, TaskInput } from '../../domain/task'
import type { AppData, AppStorage } from '../../storage/storage'

export interface TaskSnapshot { data: AppData | null; error: string | null }
export type TaskResult = { ok: true; id: string } | { ok: false; message: string }

/** Local application API. Each operation merges into the latest stored document. */
export function createTaskService(storage: AppStorage, clock: () => number = Date.now, createId: () => string = () => crypto.randomUUID()) {
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
  function mutate(id: string, change: (data: AppData) => Task[] | string): TaskResult {
    const data = read()
    if (!data) return failure(snapshot.error!)
    const tasks = change(data)
    if (typeof tasks === 'string') return failure(tasks)
    if (storage.save({ ...data, tasks }).status !== 'saved') {
      publish(snapshot.data, 'Task changes could not be saved. Your previous data is unchanged. Retry loading, then save again.')
      return failure(snapshot.error!)
    }
    publish({ ...data, tasks })
    return { ok: true, id }
  }
  function validated(input: TaskInput, data: AppData, original?: Task): TaskInput | string {
    const normalized = normalizeTaskInput(input)
    if (!normalized) return 'Enter a title and a valid schedule. Ranges need both endpoints in order; overnight times are not supported.'
    if (normalized.categoryId !== null && normalized.categoryId !== original?.categoryId &&
      !data.categories.some((category) => category.id === normalized.categoryId)) return 'The selected category is unavailable.'
    return normalized
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
        const fields = validated(input, data)
        if (typeof fields === 'string') return fields
        if (data.tasks.some((task) => task.id === id)) return 'A task with this ID already exists.'
        return [...data.tasks, { ...fields, id, completed: false, createdAt: clock(), completedAt: null }]
      })
    },
    update(id: string, input: TaskInput): TaskResult {
      return mutate(id, (data) => {
        const task = data.tasks.find((task) => task.id === id)
        if (!task) return 'Task not found. Reload the list.'
        const fields = validated(input, data, task)
        return typeof fields === 'string' ? fields : data.tasks.map((item) => item.id === id ? { ...item, ...fields } : item)
      })
    },
    setCompleted(id: string, completed: boolean): TaskResult {
      return mutate(id, (data) => data.tasks.some((task) => task.id === id)
        ? data.tasks.map((task) => task.id === id ? setTaskCompleted(task, completed, clock()) : task)
        : 'Task not found. Reload the list.')
    },
    delete(id: string): TaskResult {
      return mutate(id, (data) => {
        if (!data.tasks.some((task) => task.id === id)) return 'Task not found. Reload the list.'
        if ((data.timer.status === 'running' || data.timer.status === 'paused') && data.timer.taskId === id)
          return 'This task belongs to an unfinished Focus period. Finish or reset that period before deleting it.'
        return data.tasks.filter((task) => task.id !== id)
      })
    },
    move(id: string, direction: 'up' | 'down'): TaskResult {
      return mutate(id, (data) => {
        const index = data.tasks.findIndex((task) => task.id === id)
        if (index < 0) return 'Task not found. Reload the list.'
        const target = index + (direction === 'up' ? -1 : 1)
        const tasks = [...data.tasks]
        if (target >= 0 && target < tasks.length) [tasks[index], tasks[target]] = [tasks[target], tasks[index]]
        return tasks
      })
    },
  }
}

export type TaskService = ReturnType<typeof createTaskService>

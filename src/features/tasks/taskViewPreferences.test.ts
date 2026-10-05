import { describe, expect, it } from 'vitest'
import { createTaskViewPreferences, TASK_VIEW_KEY, tasksInWorkspace } from './taskViewPreferences'
import type { Task } from '../../domain/task'

function fixture(raw: string | null = null) {
  const values = new Map<string, string>([['focus-companion:data', 'valuable durable data']])
  if (raw !== null) values.set(TASK_VIEW_KEY, raw)
  const storage = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) } }
  return { values, storage, create: () => createTaskViewPreferences(() => storage) }
}
const tasks: Task[] = [
  { id: 'open', status: 'open', schedule: { kind: 'date', date: '2026-10-06', timeRange: null } },
  { id: 'completed', status: 'completed', schedule: { kind: 'unscheduled' } },
  { id: 'dropped', status: 'dropped', schedule: { kind: 'dateRange', startDate: '2026-10-05', endDate: '2026-10-07' } },
].map((fields) => ({ title: fields.id, content: null, categoryId: null, createdAt: 0, completedAt: null, droppedAt: null, ...fields })) as Task[]
describe('presentation-only Task workspace preferences', () => {
  it('defaults to All dates / Open without initializing or changing storage', () => {
    const f = fixture(), store = f.create()
    expect(store.getSnapshot()).toEqual({ view: 'all', status: 'open', error: null })
    expect(tasksInWorkspace(tasks, store.getSnapshot(), '2026-10-06').map((task) => task.id)).toEqual(['open'])
    expect(f.values.size).toBe(1)
  })
  it.each(['completed', 'dropped', 'all'] as const)('keeps %s reachable', (status) => {
    expect(tasksInWorkspace(tasks, { view: 'all', status }, '2026-10-06').map((task) => task.id))
      .toEqual(status === 'all' ? ['open', 'completed', 'dropped'] : [status])
  })
  it('updates immediately, notifies route subscribers, and persists only View / Status', () => {
    const f = fixture(), store = f.create(), seen: string[] = []
    const unsubscribe = store.subscribe(() => seen.push(store.getSnapshot().view))
    store.set({ view: 'today' })
    expect(seen).toEqual(['today'])
    expect(JSON.parse(f.values.get(TASK_VIEW_KEY)!)).toEqual({ view: 'today', status: 'open' })
    unsubscribe() // Tasks unmounts during navigation; its application-scoped store survives.
    store.set({ status: 'dropped' })
    expect(store.getSnapshot()).toEqual({ view: 'today', status: 'dropped', error: null })
    expect(f.create().getSnapshot()).toEqual(store.getSnapshot()) // New document / refresh / reopen.
    expect(f.values.get('focus-companion:data')).toBe('valuable durable data')
  })
  it.each(['all', 'today', 'unscheduled'] as const)('restores supported %s selection', (view) => {
    expect(fixture(JSON.stringify({ view, status: 'completed' })).create().getSnapshot())
      .toEqual({ view, status: 'completed', error: null })
  })
  it.each(['not JSON', 'null', '[]', '{}', '{"view":"tomorrow","status":"open"}',
    '{"view":"all","status":"closed"}', '{"view":["all"],"status":"open"}'])('falls back safely for invalid or unsupported preferences: %s', (raw) => {
      const f = fixture(raw)
      expect(f.create().getSnapshot()).toEqual({ view: 'all', status: 'open', error: null })
      expect(f.values.get(TASK_VIEW_KEY)).toBe(raw)
      expect(f.values.get('focus-companion:data')).toBe('valuable durable data')
    })
  it('keeps in-memory navigation state on write failure and permits a later retry', () => {
    const f = fixture(), store = createTaskViewPreferences(() => f.storage)
    const save = f.storage.setItem
    f.storage.setItem = () => { throw new Error('quota') }
    store.set({ view: 'today', status: 'dropped' })
    expect(store.getSnapshot()).toMatchObject({ view: 'today', status: 'dropped', error: expect.any(String) })
    expect(f.values.get('focus-companion:data')).toBe('valuable durable data')
    f.storage.setItem = save
    store.set({ status: 'open' })
    expect(f.create().getSnapshot()).toEqual({ view: 'today', status: 'open', error: null })
  })
  it('uses defaults when storage access is unavailable', () => {
    const store = createTaskViewPreferences(() => { throw new Error('denied') })
    expect(store.getSnapshot()).toEqual({ view: 'all', status: 'open', error: null })
    expect(() => store.set({ status: 'completed' })).not.toThrow()
  })
  it('preserves existing date/status filtering, including inclusive date-range overlap', () => {
    expect(tasksInWorkspace(tasks, { view: 'today', status: 'all' }, '2026-10-06').map((task) => task.id)).toEqual(['open', 'dropped'])
    expect(tasksInWorkspace(tasks, { view: 'unscheduled', status: 'all' }, '2026-10-06').map((task) => task.id)).toEqual(['completed'])
    expect(tasksInWorkspace(tasks, { view: 'today', status: 'dropped' }, '2026-10-06').map((task) => task.id)).toEqual(['dropped'])
  })
})

import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter, STORAGE_KEY } from './localStorageAdapter'
import { createDefaultData } from './storage'
import { reconcileTimer, transitionTimer } from '../domain/timer'

function fixture(initial: string | null = null) {
  const values = new Map<string, string>()
  if (initial !== null) values.set(STORAGE_KEY, initial)
  const adapter = createLocalStorageAdapter(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
  }))
  return { adapter, values }
}

describe('local storage boundary', () => {
  it.each([
    { kind: 'date', date: '2026-02-29', timeRange: null },
    { kind: 'unscheduled', date: '2026-10-06' },
    { kind: 'dateRange', startDate: '2026-10-06' },
  ])('protects invalid schema v3 task schedules %j', (schedule) => {
    const data = createDefaultData()
    const raw = JSON.stringify({ ...data, tasks: [{ id: 'task', title: 'Keep', content: null, schedule,
      categoryId: null, completed: false, createdAt: 0, completedAt: null }] })
    const { adapter, values } = fixture(raw)
    expect(adapter.load().status).toBe('invalid')
    expect(adapter.save(data).status).toBe('blocked')
    expect(values.get(STORAGE_KEY)).toBe(raw)
  })
  it('rejects string schema versions and break task targets', () => {
    for (const data of [{ ...createDefaultData(), schemaVersion: '3' },
      { ...createDefaultData(), timer: { status: 'running', mode: 'shortBreak', id: 'break', startedAt: 1000,
        durationMs: 2000, accumulatedMs: 0, runStartedAt: 1000, taskId: 'task', categoryId: null } }]) {
      const { adapter } = fixture(JSON.stringify(data))
      expect(adapter.load().status).toBe('invalid')
      expect(adapter.save(createDefaultData()).status).toBe('blocked')
    }
  })
  it('round-trips running, paused and completed timer states', () => {
    const { adapter } = fixture()
    const data = createDefaultData()
    const running = transitionTimer(data.timer, { type: 'start', id: 'period' }, data.settings, 1000)
    const paused = transitionTimer(running, { type: 'pause' }, data.settings, 1500)
    const completed = reconcileTimer(running, 1501000)
    for (const timer of [running, paused, completed]) {
      const document = { ...data, timer }
      expect(adapter.save(document).status).toBe('saved')
      expect(adapter.load()).toEqual({ status: 'ready', data: document })
    }
  })

  it('preserves invalid v2 timer data instead of replacing it', () => {
    const raw = JSON.stringify({ ...createDefaultData(), timer: { status: 'running', mode: 'focus' } })
    const { adapter, values } = fixture(raw)
    expect(adapter.load().status).toBe('invalid')
    expect(adapter.save(createDefaultData()).status).toBe('blocked')
    expect(values.get(STORAGE_KEY)).toBe(raw)
  })

  it('distinguishes missing data and persists defaults without seeding records', () => {
    const { adapter } = fixture()
    expect(adapter.load()).toEqual({ status: 'missing' })
    const data = createDefaultData()
    expect(adapter.save(data)).toEqual({ status: 'saved' })
    expect(adapter.load()).toEqual({ status: 'ready', data })
    expect(data.tasks).toEqual([])
    expect(data.categories).toEqual([])
    expect(data.sessions).toEqual([])
  })

  it('round-trips every domain record and duration unit', () => {
    const { adapter } = fixture()
    const data = createDefaultData()
    data.tasks.push({ id: 'task-1', title: 'Read', categoryId: 'category-1', completed: true, createdAt: 1000, completedAt: 3000, content: null, schedule: { kind: 'unscheduled' } })
    data.categories.push({ id: 'category-1', name: 'Reading', createdAt: 1000 })
    data.sessions.push({ id: 'session-1', taskId: 'task-1', categoryId: 'category-1', startedAt: 1000, endedAt: 3000, durationSeconds: 2 })
    expect(adapter.save(data).status).toBe('saved')
    expect(adapter.load()).toEqual({ status: 'ready', data })
  })

  it.each(['{broken', 'null', '{}', ''])('preserves malformed data: %s', (raw) => {
    const { adapter, values } = fixture(raw)
    expect(adapter.load()).toEqual({ status: 'invalid' })
    expect(adapter.save(createDefaultData())).toEqual({ status: 'blocked' })
    expect(values.get(STORAGE_KEY)).toBe(raw)
  })

  it('rejects an invalid nested record without overwriting it', () => {
    const raw = JSON.stringify({ ...createDefaultData(), tasks: [{ id: 'task-1' }] })
    const { adapter, values } = fixture(raw)
    expect(adapter.load().status).toBe('invalid')
    expect(adapter.save(createDefaultData()).status).toBe('blocked')
    expect(values.get(STORAGE_KEY)).toBe(raw)
  })

  it('preserves unsupported schema versions', () => {
    const raw = JSON.stringify({ ...createDefaultData(), schemaVersion: 4 })
    const { adapter, values } = fixture(raw)
    expect(adapter.load()).toEqual({ status: 'unsupported' })
    expect(adapter.save(createDefaultData())).toEqual({ status: 'blocked' })
    expect(values.get(STORAGE_KEY)).toBe(raw)
  })

  it('reports denied access to the browser storage property', () => {
    const adapter = createLocalStorageAdapter(() => { throw new Error('Access denied') })
    expect(adapter.load()).toEqual({ status: 'unavailable' })
    expect(adapter.save(createDefaultData())).toEqual({ status: 'unavailable' })
  })

  it('reports read failures and prevents writes', () => {
    let writes = 0
    const adapter = createLocalStorageAdapter(() => ({
      getItem: () => { throw new Error('Read denied') },
      setItem: () => { writes += 1 },
    }))
    expect(adapter.load().status).toBe('unavailable')
    expect(adapter.save(createDefaultData()).status).toBe('unavailable')
    expect(writes).toBe(0)
  })

  it('reports write failures without changing existing data', () => {
    const data = createDefaultData()
    const raw = JSON.stringify(data)
    const adapter = createLocalStorageAdapter(() => ({
      getItem: () => raw,
      setItem: () => { throw new Error('Quota exceeded') },
    }))
    expect(adapter.save(data).status).toBe('unavailable')
    expect(adapter.load()).toEqual({ status: 'ready', data })
  })

  it('checks the current stored value before each write', () => {
    const { adapter, values } = fixture()
    expect(adapter.load().status).toBe('missing')
    values.set(STORAGE_KEY, 'preserve this')
    expect(adapter.save(createDefaultData()).status).toBe('blocked')
    expect(values.get(STORAGE_KEY)).toBe('preserve this')
  })
})

import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter, STORAGE_KEY } from './localStorageAdapter'
import { createDefaultData } from './storage'

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
    data.tasks.push({ id: 'task-1', title: 'Read', categoryId: 'category-1', completed: true, createdAt: 1000, completedAt: 3000 })
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
    const raw = JSON.stringify({ ...createDefaultData(), schemaVersion: 2 })
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

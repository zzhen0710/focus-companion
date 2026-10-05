import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter } from './localStorageAdapter'
import { migrateV1ToV2 } from './migrations'
import { createDefaultData } from './storage'
import type { LegacyAppData } from './storage'

function legacy(): LegacyAppData {
  const { timer: _timer, ...data } = createDefaultData()
  void _timer
  return { ...data, schemaVersion: 1,
    tasks: [{ id: 'task', title: 'Preserve me', categoryId: 'category', completed: true, createdAt: 1000, completedAt: 2000 }],
    categories: [{ id: 'category', name: 'Work', createdAt: 1000 }],
    sessions: [{ id: 'session', taskId: 'task', categoryId: 'category', startedAt: 1000, endedAt: 2000, durationSeconds: 1 }],
    settings: { focusDurationSeconds: 1800, shortBreakDurationSeconds: 600, longBreakDurationSeconds: 1200 },
  }
}

describe('v1 to v2 migration', () => {
  it('preserves all records and settings without mutating the input', () => {
    const old = legacy()
    const before = JSON.stringify(old)
    const migrated = migrateV1ToV2(old)
    expect(migrated).toEqual({ ...old, schemaVersion: 2, timer: { status: 'idle', mode: 'focus' } })
    expect(JSON.stringify(old)).toBe(before)
  })

  it('loads migration in memory and writes only when explicitly saved', () => {
    let raw = JSON.stringify(legacy())
    const old = raw
    const adapter = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } }))
    const result = adapter.load()
    expect(result.status).toBe('ready')
    expect(raw).toBe(old)
    if (result.status !== 'ready') throw new Error('Expected migrated data')
    expect(result.needsMigration).toBe(true)
    expect(adapter.save(result.data).status).toBe('saved')
    expect(JSON.parse(raw)).toEqual(migrateV1ToV2(legacy()))
  })

  it('leaves the original v1 document intact when migration cannot be saved', () => {
    const raw = JSON.stringify(legacy())
    const adapter = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { throw new Error('Quota') } }))
    const result = adapter.load()
    if (result.status !== 'ready') throw new Error('Expected migrated data')
    expect(adapter.save(result.data).status).toBe('unavailable')
    expect(adapter.load()).toEqual(result)
    expect(JSON.parse(raw).schemaVersion).toBe(1)
  })

  it('does not migrate invalid v1 data or overwrite unknown versions', () => {
    for (const data of [{ schemaVersion: 1 }, { ...legacy(), schemaVersion: 99 }]) {
      let writes = 0
      const adapter = createLocalStorageAdapter(() => ({ getItem: () => JSON.stringify(data), setItem: () => { writes += 1 } }))
      expect(adapter.load().status).toBe(data.schemaVersion === 1 ? 'invalid' : 'unsupported')
      expect(adapter.save(createDefaultData()).status).toBe('blocked')
      expect(writes).toBe(0)
    }
  })
})

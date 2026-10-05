import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter } from './localStorageAdapter'
import { migrateV1ToV2, migrateV2ToV3, migrateV3ToV4 } from './migrations'
import { createDefaultData } from './storage'
import type { LegacyAppData, V2AppData } from './storage'

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
    expect(JSON.parse(raw)).toEqual(migrateV3ToV4(migrateV2ToV3(migrateV1ToV2(legacy()))))
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

describe('v2 to v3 migration', () => {
  it.each(['idle', 'running', 'paused', 'completed'] as const)('preserves populated data and %s timer without recovery during load', (status) => {
    const base = migrateV1ToV2(legacy())
    const common = { mode: 'focus' as const, id: 'timer', startedAt: 1000, durationMs: 2000, accumulatedMs: 500 }
    const timer: V2AppData['timer'] = status === 'idle' ? { status, mode: 'focus' }
      : status === 'running' ? { ...common, status, runStartedAt: 1500 }
        : status === 'paused' ? { ...common, status } : { ...common, status, accumulatedMs: 2000, endedAt: 3000 }
    const old: V2AppData = { ...base, timer }
    old.tasks.push({ ...old.tasks[0], id: 'second', completed: true, completedAt: null })
    old.tasks.push({ ...old.tasks[0], id: 'third', completed: false, completedAt: 2000 })
    const before = JSON.stringify(old)
    const migrated = migrateV2ToV3(old)
    expect(JSON.stringify(old)).toBe(before)
    expect(migrated).toEqual({ ...old, schemaVersion: 3,
      tasks: old.tasks.map((task) => ({ ...task, content: null, schedule: { kind: 'unscheduled' } })),
      timer: status === 'idle' ? timer : { ...timer, taskId: null, categoryId: null } })
    let raw = before
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } }))
    expect(storage.load()).toEqual({ status: 'ready', data: migrateV3ToV4(migrated), needsMigration: true })
    expect(raw).toBe(before)
    storage.save(migrateV3ToV4(migrated))
    expect(JSON.parse(raw)).toEqual(migrateV3ToV4(migrated))
  })
  it('keeps original v2 bytes on a failed migration write', () => {
    const raw = JSON.stringify(migrateV1ToV2(legacy()))
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { throw new Error('Quota') } }))
    const loaded = storage.load()
    if (loaded.status !== 'ready') throw new Error('Expected migrated data')
    expect(storage.save(loaded.data).status).toBe('unavailable')
    expect(JSON.parse(raw).schemaVersion).toBe(2)
  })
})

describe('v3 to v4 migration', () => {
  it.each(['idle', 'running', 'paused', 'completed'] as const)('truthfully preserves populated v3 and %s without recovery or fabricated history', (status) => {
    const old = migrateV2ToV3(migrateV1ToV2(legacy()))
    old.tasks.push({ ...old.tasks[0], id: 'unknown', completed: true, completedAt: null })
    old.tasks.push({ ...old.tasks[0], id: 'odd', completed: false, completedAt: 2000 })
    const base = { mode: 'focus' as const, id: 'active', taskId: 'task', categoryId: 'category', startedAt: 1000, durationMs: 2000 }
    old.timer = status === 'idle' ? { status, mode: 'focus' } : status === 'running' ? { ...base, status, accumulatedMs: 500, runStartedAt: 1500 }
      : status === 'paused' ? { ...base, status, accumulatedMs: 500 } : { ...base, status, accumulatedMs: 2000, endedAt: 3000 }
    const before = JSON.stringify(old), next = migrateV3ToV4(old)
    expect(JSON.stringify(old)).toBe(before)
    expect(next.tasks.map((task) => [task.id, task.status, task.completedAt])).toEqual([
      ['task', 'completed', 2000], ['unknown', 'completed', null], ['odd', 'open', 2000]])
    expect(next.sessions[0]).toEqual({ ...old.sessions[0], outcome: 'completed', plannedDurationSeconds: 1, taskTitleSnapshot: null })
    expect(next.taskEvents).toEqual([]); expect(next.reviews).toEqual([]); expect(next.activeReview).toBeNull()
    expect(next.timer).toEqual(status === 'idle' ? old.timer : { ...old.timer, taskTitleSnapshot: null })
    let raw = before
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } }))
    expect(storage.load()).toEqual({ status: 'ready', data: next, needsMigration: true })
    expect(raw).toBe(before)
    expect(storage.save(next).status).toBe('saved')
    expect(JSON.parse(raw)).toEqual(next)
  })
  it('retains a failed v3 write and accepted zero-duration legacy session without invented events', () => {
    const old = migrateV2ToV3(migrateV1ToV2(legacy()))
    old.sessions[0].durationSeconds = 0
    const raw = JSON.stringify(old)
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { throw Error('Quota') } }))
    const loaded = storage.load()
    if (loaded.status !== 'ready') throw Error('Expected ready')
    expect(loaded.data.sessions[0]).toMatchObject({ durationSeconds: 0, plannedDurationSeconds: 0, outcome: 'completed' })
    expect(storage.save(loaded.data).status).toBe('unavailable')
    expect(raw).toBe(JSON.stringify(old))
  })
})

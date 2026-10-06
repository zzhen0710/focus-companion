import { describe, expect, it, vi } from 'vitest'
import { createInsightsService } from './insightsService'
import { createDefaultData } from '../../storage/storage'
import type { LoadResult } from '../../storage/storage'
import { createLocalStorageAdapter } from '../../storage/localStorageAdapter'

const now = new Date(2026, 9, 6, 12).getTime()
describe('Insights read-only service', () => {
  it('reads stored facts without saves, timer recovery, or Review settlement', () => {
    const data = createDefaultData()
    data.timer = { status: 'running', mode: 'focus', id: 'running', taskId: null, categoryId: null, taskTitleSnapshot: null,
      startedAt: now - 3000, runStartedAt: now - 3000, accumulatedMs: 1000, durationMs: 2000 }
    data.activeReview = { id: 'review', startedAt: now - 1000, localDate: '2026-10-06', taskIds: ['deleted'] }
    data.taskEvents = [{ id: 'action', taskId: 'deleted', categoryId: null, occurredAt: now, reviewId: 'review', type: 'taskCompleted',
      taskSnapshot: { title: 'Historical', schedule: { kind: 'unscheduled' } } }]
    const raw = JSON.stringify(data), setItem = vi.fn()
    const adapter = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem }))
    const service = createInsightsService({ load: adapter.load }, () => now)
    expect(service.query('today')).toMatchObject({ focus: { sessionCount: 0 }, review: { completedCount: 0, actions: { completions: 1 } } })
    service.query('week'); service.query('last7days'); service.reload()
    expect(setItem).not.toHaveBeenCalled()
    expect(JSON.stringify(data)).toBe(raw)
    expect(JSON.parse(raw).timer.status).toBe('running')
    expect(JSON.parse(raw).activeReview).not.toBeNull()
  })
  it('publishes fresh facts and calendar context, with unsubscribe support', () => {
    const data = createDefaultData()
    let currentTime = now
    const service = createInsightsService({ load: () => ({ status: 'ready', data: structuredClone(data) }) }, () => currentTime)
    const listener = vi.fn(), unsubscribe = service.subscribe(listener)
    data.sessions.push({ id: 'session', taskId: null, categoryId: null, taskTitleSnapshot: null, startedAt: now - 3000,
      endedAt: now, durationSeconds: 2, plannedDurationSeconds: 3, outcome: 'interrupted' })
    service.reload()
    expect(service.query('today')?.focus.focusedSeconds).toBe(2)
    currentTime = new Date(2026, 9, 7, 0).getTime(); service.reload()
    expect(service.getSnapshot().context.today).toBe('2026-10-07')
    expect(service.query('today')?.focus.focusedSeconds).toBe(0)
    expect(service.query('last7days')?.focus.focusedSeconds).toBe(2)
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe(); service.reload(); expect(listener).toHaveBeenCalledTimes(2)
  })
  it.each(['missing', 'invalid', 'unsupported', 'unavailable'] as const)('does not turn %s reads into fake zero results', (status) => {
    let result: LoadResult = { status }
    const service = createInsightsService({ load: () => result }, () => now)
    expect(service.query('today')).toBeNull(); expect(service.getSnapshot().error).not.toBeNull()
    const data = createDefaultData()
    data.sessions.push({ id: 'saved', taskId: null, categoryId: null, taskTitleSnapshot: null, startedAt: now - 1000,
      endedAt: now, durationSeconds: 1, plannedDurationSeconds: 1, outcome: 'completed' })
    result = { status: 'ready', data }; service.reload()
    expect(service.getSnapshot().error).toBeNull()
    result = { status }; service.reload()
    expect(service.getSnapshot().error).not.toBeNull()
    expect(service.query('today')?.focus.focusedSeconds).toBe(1)
  })
  it.each(['{bad', '{"schemaVersion":99}'])('never overwrites protected raw data: %s', (raw) => {
    const setItem = vi.fn()
    const service = createInsightsService(createLocalStorageAdapter(() => ({ getItem: () => raw, setItem })), () => now)
    expect(service.query('today')).toBeNull(); expect(setItem).not.toHaveBeenCalled()
  })
  it('leaves migration persistence to bootstrap', () => {
    const service = createInsightsService({ load: () => ({ status: 'ready', data: createDefaultData(), needsMigration: true }) }, () => now)
    expect(service.query('today')).toBeNull(); expect(service.getSnapshot().error).not.toBeNull()
  })
})

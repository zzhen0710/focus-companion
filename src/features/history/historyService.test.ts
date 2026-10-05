import { describe, expect, it } from 'vitest'
import { createHistoryService } from './historyService'
import { createLocalStorageAdapter } from '../../storage/localStorageAdapter'
import { createDefaultData } from '../../storage/storage'
describe('History read boundary', () => {
  it('reloads facts without writing or recovering timer state', () => {
    const data = createDefaultData()
    data.timer = { status: 'running', mode: 'focus', id: 'active', taskId: null, categoryId: null,
      taskTitleSnapshot: null, startedAt: 0, runStartedAt: 0, accumulatedMs: 1000, durationMs: 2000 }
    let raw = JSON.stringify(data), writes = 0
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { writes++ } }))
    const service = createHistoryService(storage)
    data.sessions.push({ id: 'old', taskId: null, categoryId: null, taskTitleSnapshot: null,
      outcome: 'interrupted', durationSeconds: 1, plannedDurationSeconds: 2, startedAt: 0, endedAt: 1000 })
    raw = JSON.stringify(data); service.reload()
    expect(service.getSnapshot().groups.flatMap((group) => group.entries)).toHaveLength(1)
    expect(JSON.parse(raw).timer.status).toBe('running'); expect(writes).toBe(0)
  })
  it.each(['{bad', '{"schemaVersion":99}'])('retains invalid/unsupported bytes: %s', (raw) => {
    let writes = 0
    const service = createHistoryService(createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: () => { writes++ } })))
    expect(service.getSnapshot().error).not.toBeNull(); expect(writes).toBe(0)
  })
})

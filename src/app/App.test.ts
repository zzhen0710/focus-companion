import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultData } from '../storage/storage'
import { createSceneNavigation } from './sceneNavigation'
import { createProductionBridge } from '../experience/productionBridge'
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules() })
describe('production scene service integration', () => {
  it('uses the existing Timer through switching/collapse and pure reads never open Review', async () => {
    vi.resetModules(); vi.useFakeTimers({ toFake: ['Date'] })
    const now = new Date(2026, 9, 6, 12).getTime(); vi.setSystemTime(now)
    const data = createDefaultData(); data.settings.focusDurationSeconds = 60
    let raw = JSON.stringify(data), writes = 0
    vi.stubGlobal('window', { localStorage: { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; writes++ } } })
    const { timerController, taskService, reviewService, insightsService, historyService, loadExperienceFacts } = await import('./services')
    const task = taskService.create({ title: 'Overdue', content: null, categoryId: null,
      schedule: { kind: 'date', date: '2026-10-05', timeRange: null } })
    if (!task.ok) throw new Error(task.message)
    const location = { hash: '#/focus' }
    const navigation = createSceneNavigation({ location, history: { pushState: (_a, _b, hash) => { location.hash = hash },
      replaceState: (_a, _b, hash) => { location.hash = hash } }, addEventListener() {}, removeEventListener() {} })
    const bridge = createProductionBridge(loadExperienceFacts, timerController, insightsService)
    const detach = bridge.attach(); await Promise.resolve()
    const beforeReads = raw, priorWrites = writes
    loadExperienceFacts(); historyService.reload(); insightsService.reload(); bridge.refresh(); await Promise.resolve()
    expect(raw).toBe(beforeReads); expect(writes).toBe(priorWrites)
    expect(JSON.parse(raw).activeReview).toBeNull()
    timerController.start(task.id)
    const id = timerController.getSnapshot().data!.timer
    navigation.dispatch({ type: 'activate', tool: 'tasks' })
    navigation.dispatch({ type: 'swap', from: 'primary', to: 'auxiliaryA' })
    expect(timerController.getSnapshot().data!.timer).toEqual(id)
    navigation.dispatch({ type: 'promote', tool: 'focus' }); navigation.dispatch({ type: 'collapse' })
    navigation.dispatch({ type: 'reveal' }); navigation.dispatch({ type: 'activate', tool: 'insights' })
    expect(timerController.getSnapshot().data!.timer).toEqual(id)
    vi.setSystemTime(now + 60_000); timerController.tick(); await Promise.resolve()
    expect(JSON.parse(raw).sessions).toHaveLength(1)
    expect(insightsService.query('today')?.focus.completedCount).toBe(1)
    expect(JSON.parse(raw).activeReview).toBeNull()
    navigation.dispatch({ type: 'activate', tool: 'review' })
    expect(navigation.getSnapshot().workspace.slots.auxiliaryA).toBe('review')
    loadExperienceFacts(); expect(JSON.parse(raw).activeReview).toBeNull()
    navigation.dispatch({ type: 'promote', tool: 'review' }); reviewService.open()
    const cohort = JSON.parse(raw).activeReview
    expect(cohort.taskIds).toEqual([task.id])
    navigation.dispatch({ type: 'close', tool: 'review' }); expect(JSON.parse(raw).activeReview).toEqual(cohort)
    detach()
  })
})

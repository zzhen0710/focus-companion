import { describe, expect, it, vi } from 'vitest'
import { createProductionBridge } from './productionBridge'
import { createTimerController } from '../features/focus/timerController'
import { createDefaultData } from '../storage/storage'
import type { FactsLoad } from './contextStore'
import type { AppData } from '../storage/storage'

function fixture() {
  let now = new Date(2026, 9, 6, 12).getTime(), data = createDefaultData(), fail = false
  data.settings.focusDurationSeconds = 2
  const listeners = new Set<() => void>()
  const controller = createTimerController({ load: () => ({ status: 'ready', data }), save: (next) => {
    data = next; listeners.forEach((fn) => fn()); return { status: 'saved' }
  } }, () => now, () => 'period')
  const load = vi.fn((): FactsLoad => fail ? { status: 'unavailable', error: 'read failed' }
    : { status: 'ready', facts: data })
  const bridge = createProductionBridge(load, controller, {
    subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn) } },
  }, () => now)
  const detach = bridge.attach()
  bridge.setAttention({ visible: true, decisionActive: false, reviewOpen: false, blockingError: false })
  return { bridge, controller, load, detach, data: () => data, at(time: number) { now += time },
    fail(value: boolean) { fail = value }, saved(next: AppData) { data = next; listeners.forEach((fn) => fn()) } }
}
const flush = () => Promise.resolve()
describe('read-only production Experience bridge', () => {
  it('coalesces saved completion and final Timer publication into one coherent observation', async () => {
    const f = fixture(); await flush()
    expect(f.bridge.getSnapshot().intent.primaryReaction).toBeNull()
    f.controller.start(); await flush(); f.at(2000)
    const observed: string[] = []
    f.bridge.subscribe(() => observed.push(f.bridge.getSnapshot().intent.presence))
    f.controller.tick(); await flush()
    expect(observed).toEqual(['neutral'])
    expect(f.bridge.getSnapshot().intent.primaryReaction?.kind).toBe('focusAcknowledgment')
    f.bridge.refresh(); f.controller.tick(); await flush()
    expect(f.data().sessions).toHaveLength(1)
    f.at(4000); f.controller.tick(); await flush()
    expect(f.bridge.getSnapshot().intent.primaryReaction).toBeNull()
    f.detach()
  })
  it('does not load saved history for display ticks and cleans subscriptions on detach', async () => {
    const f = fixture(); await flush(); const calls = f.load.mock.calls.length
    f.controller.start(); await flush(); const afterStart = f.load.mock.calls.length
    for (let i = 0; i < 3; i++) { f.at(100); f.controller.tick(); await flush() }
    expect(f.load).toHaveBeenCalledTimes(afterStart)
    expect(afterStart).toBe(calls + 1)
    f.detach(); f.bridge.refresh(); f.controller.tick(); await flush()
    expect(f.load).toHaveBeenCalledTimes(afterStart)
  })
  it('consumes hidden-message events without replay when message visibility returns', async () => {
    const f = fixture(); await flush()
    f.bridge.setAttention({ visible: false, decisionActive: false, reviewOpen: false, blockingError: false })
    f.controller.start(); f.at(2000); f.controller.tick(); await flush()
    f.bridge.setAttention({ visible: true, decisionActive: false, reviewOpen: false, blockingError: false }); await flush()
    expect(f.bridge.getSnapshot().intent.primaryReaction).toBeNull()
    expect(f.data().sessions).toHaveLength(1); f.detach()
  })
  it('preserves stale facts, silently recovers, and never opens Review or writes during reads', async () => {
    const f = fixture(); await flush(); const before = JSON.stringify(f.data())
    f.fail(true); f.bridge.refresh(); await flush()
    expect(f.bridge.getSnapshot().context.saved.status).toBe('stale')
    f.fail(false); f.bridge.refresh(); await flush()
    expect(f.bridge.getSnapshot().context.saved.status).toBe('ready')
    expect(f.bridge.getSnapshot().intent.primaryReaction).toBeNull()
    expect(JSON.stringify(f.data())).toBe(before); expect(f.data().activeReview).toBeNull(); f.detach()
  })
  it('reconnects after StrictMode cleanup without applying a stale queued observation', async () => {
    const f = fixture(); f.detach(); const detach = f.bridge.attach(); await flush()
    expect(f.bridge.getSnapshot().context.saved.status).toBe('ready')
    f.bridge.selectTask('missing'); await flush()
    expect(f.bridge.getSnapshot().context.selection.currentTask).toMatchObject({ status: 'ready', value: null })
    detach()
  })
})

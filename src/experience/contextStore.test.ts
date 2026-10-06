import { afterEach, describe, expect, it, vi } from 'vitest'
import { createExperienceContextStore } from './contextStore'
import { createFixtureSource } from '../prototypes/main-scene/fixtures'
import { attachReadRefresh } from '../app/readRefresh'
import * as projection from './context'

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })
const referenceTime = new Date(2026, 9, 6, 12).getTime()
describe('thin read-only context coordinator', () => {
  it('loads explicitly, refreshes saved facts, updates selection, and notifies subscribers', () => {
    const source = createFixtureSource(() => referenceTime), store = createExperienceContextStore(source.load, source.now), notify = vi.fn()
    expect(store.getSnapshot().saved.status).toBe('loading')
    const detach = store.subscribe(notify)
    store.refreshSaved(); store.updateLive(source.getLive()); store.selectTask('notes')
    expect(store.getSnapshot().saved.status).toBe('ready')
    expect(store.getSnapshot().selection.currentTask).toMatchObject({ value: { id: 'notes' } })
    source.commit('task'); store.refreshSaved()
    expect(store.getSnapshot().saved).toMatchObject({ value: { lastTaskOutcome: { type: 'taskCompleted' } } })
    expect(notify).toHaveBeenCalledTimes(4)
    detach(); store.tick(); expect(notify).toHaveBeenCalledTimes(4)
  })
  it('preserves unavailable and last-known stale data, then recovers', () => {
    const source = createFixtureSource(() => referenceTime), store = createExperienceContextStore(source.load, source.now)
    source.fail(); store.refreshSaved(); expect(store.getSnapshot().saved.status).toBe('unavailable')
    source.recover(); store.refreshSaved()
    const previous = store.getSnapshot().saved
    source.fail(); source.advance(1000); store.refreshSaved()
    expect(store.getSnapshot().saved).toMatchObject({ ...previous, status: 'stale' })
    source.recover(); store.refreshSaved(); expect(store.getSnapshot().saved.status).toBe('ready')
  })
  it('uses latest live time without historical recomputation on ticks', () => {
    const source = createFixtureSource(() => referenceTime), load = vi.fn(source.load)
    source.setScenario('focus-running')
    const project = vi.spyOn(projection, 'projectSavedFacts'), store = createExperienceContextStore(load, source.now)
    store.refreshSaved(); store.updateLive(source.getLive())
    const before = store.getSnapshot()
    source.advance(20_000)
    for (let index = 0; index < 20; index++) store.tick()
    expect(load).toHaveBeenCalledTimes(1); expect(project).toHaveBeenCalledTimes(1)
    expect(store.getSnapshot().saved).toBe(before.saved)
    expect(store.getSnapshot().now).toBe(source.now())
    expect(store.getSnapshot().focus).toMatchObject({ value: { elapsedMs: 200_000 } })
  })
  it('refreshes once on local-date change, including failed rollover and recovery', () => {
    const source = createFixtureSource(() => new Date(2026, 9, 6, 23, 59).getTime())
    const load = vi.fn(source.load), store = createExperienceContextStore(load, source.now)
    store.refreshSaved(); source.fail(); source.toMidnight(); store.tick()
    expect(store.getSnapshot().localDate).toBe('2026-10-07')
    expect(store.getSnapshot().saved).toMatchObject({ status: 'stale', value: { localDate: '2026-10-06' } })
    store.tick(); expect(load).toHaveBeenCalledTimes(2)
    source.recover(); store.refreshSaved()
    expect(store.getSnapshot().saved).toMatchObject({ status: 'ready', value: { todayFocus: { focusedSeconds: 0 } } })
  })
  it('continues read freshness independently of panels and cleans up lifecycle bindings', () => {
    vi.useFakeTimers()
    const source = createFixtureSource(() => referenceTime), load = vi.fn(source.load), store = createExperienceContextStore(load, source.now)
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
    const win = Object.assign(new EventTarget(), { setInterval: (handler: TimerHandler, ms?: number) =>
      Number(setInterval(handler as () => void, ms)), clearInterval: (id: number) => clearInterval(id) })
    const detach = attachReadRefresh(store.refreshSaved, doc, win)
    vi.advanceTimersByTime(60_000); expect(load).toHaveBeenCalledTimes(1)
    source.commit('task'); win.dispatchEvent(new Event('focus'))
    expect(store.getSnapshot().saved).toMatchObject({ value: { lastTaskOutcome: { type: 'taskCompleted' } } })
    win.dispatchEvent(Object.assign(new Event('storage'), { key: 'focus-companion:data' }))
    expect(load).toHaveBeenCalledTimes(3)
    detach(); vi.advanceTimersByTime(60_000); win.dispatchEvent(new Event('focus'))
    expect(load).toHaveBeenCalledTimes(3)
  })
})

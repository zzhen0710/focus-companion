import { describe, expect, it } from 'vitest'
import { evaluateExperience, initialRuleMemory, PRIMARY_DISPLAY_MS, PRIMARY_COOLDOWN_MS, EVENT_FRESHNESS_MS } from './rules'
import type { Attention } from './rules'
import { createFixtureSource } from '../prototypes/main-scene/fixtures'
import { createExperienceContextStore } from './contextStore'

const attention: Attention = { visible: true, decisionActive: false, reviewOpen: false, blockingError: false }
function setup() {
  const source = createFixtureSource(() => new Date(2026, 9, 6, 12).getTime())
  const store = createExperienceContextStore(source.load, source.now)
  const refresh = () => { store.refreshSaved(); store.updateLive(source.getLive()) }
  refresh()
  const baseline = evaluateExperience(store.getSnapshot(), attention, initialRuleMemory()).nextMemory
  return { source, store, refresh, baseline }
}
describe('small deterministic experience arbitration', () => {
  it('baselines even recent saved history without replay', () => {
    const { source, store, refresh } = setup()
    source.commit('both'); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, initialRuleMemory()).intent.primary).toBeNull()
  })
  it.each(['focus', 'task', 'both'] as const)('acknowledges new %s once with Focus priority', (kind) => {
    const { source, store, refresh, baseline } = setup()
    source.commit(kind); refresh()
    const result = evaluateExperience(store.getSnapshot(), attention, baseline)
    expect(result.intent.primary?.kind).toBe(kind === 'task' ? 'taskAcknowledgment' : 'focusAcknowledgment')
    source.advance(PRIMARY_DISPLAY_MS); refresh()
    const repeat = evaluateExperience(store.getSnapshot(), attention, result.nextMemory)
    expect(repeat.intent.primary).toBeNull()
    source.advance(PRIMARY_COOLDOWN_MS); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, repeat.nextMemory).intent.primary).toBeNull()
  })
  it.each(['focus', 'decision', 'hidden', 'blocking'] as const)('consumes %s-suppressed events without backlog', (reason) => {
    const { source, store, refresh, baseline } = setup()
    source.commit('task')
    if (reason === 'focus') source.setScenario('focus-running')
    if (reason === 'focus') source.commit('task')
    refresh()
    const blocked = { ...attention, decisionActive: reason === 'decision', visible: reason !== 'hidden', blockingError: reason === 'blocking' }
    const result = evaluateExperience(store.getSnapshot(), blocked, baseline)
    expect(result.intent.primary).toBeNull()
    if (reason === 'focus') {
      const live = source.getLive()
      if (live.status === 'ready') store.updateLive({ ...live, value: { ...live.value, timer: { status: 'idle', mode: 'focus' } } })
    }
    expect(evaluateExperience(store.getSnapshot(), attention, result.nextMemory).intent.primary).toBeNull()
  })
  it('expires old and future events and never replays them', () => {
    const { source, store, refresh, baseline } = setup()
    source.commit('focus'); source.advance(EVENT_FRESHNESS_MS + 1); refresh()
    const result = evaluateExperience(store.getSnapshot(), attention, baseline)
    expect(result.intent.primary).toBeNull()
    source.advance(-EVENT_FRESHNESS_MS); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, result.nextMemory).intent.primary).toBeNull()
  })
  it('enforces cooldown and consumes its losing candidate', () => {
    const { source, store, refresh, baseline } = setup()
    source.commit('focus'); refresh()
    const first = evaluateExperience(store.getSnapshot(), attention, baseline)
    source.advance(PRIMARY_DISPLAY_MS + 1); source.commit('task'); refresh()
    const second = evaluateExperience(store.getSnapshot(), attention, first.nextMemory)
    expect(second.intent.primary).toBeNull()
    source.advance(PRIMARY_COOLDOWN_MS); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, second.nextMemory).intent.primary).toBeNull()
    source.commit('task'); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, second.nextMemory).intent.primary?.kind).toBe('taskAcknowledgment')
  })
  it('offers one compatible Review cue and does not auto-open anything', () => {
    const { source, store, refresh, baseline } = setup()
    source.setScenario('review-pending'); source.commit('focus'); refresh()
    const result = evaluateExperience(store.getSnapshot(), attention, baseline)
    expect(result.intent.ambient).toEqual({ kind: 'reviewPending' })
    expect(result.intent.primary?.kind).toBe('focusAcknowledgment')
    const opened = evaluateExperience(store.getSnapshot(), { ...attention, reviewOpen: true }, result.nextMemory)
    expect(opened.intent.ambient).toBeNull()
    expect(evaluateExperience(store.getSnapshot(), attention, opened.nextMemory).intent.ambient).toBeNull()
  })
  it('recovers with a new baseline and no stale-gap replay', () => {
    const { source, store, refresh, baseline } = setup()
    source.fail(); refresh()
    const failed = evaluateExperience(store.getSnapshot(), attention, baseline)
    expect(failed.intent.primary).toBeNull(); expect(failed.nextMemory.initialized).toBe(false)
    source.commit('both'); source.recover(); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, failed.nextMemory).intent.primary).toBeNull()
  })
  it.each(['pending-completion', 'pending-reset', 'unknown-timer'] as const)('suppresses %s', (scenario) => {
    const { source, store, refresh, baseline } = setup()
    source.setScenario(scenario); source.commit('task'); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, baseline).intent.primary).toBeNull()
  })
  it('represents interrupted history without a negative reaction or psychological state', () => {
    const { source, store, refresh, baseline } = setup()
    source.commit('interrupted'); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, baseline).intent).toEqual({ presence: 'neutral', primary: null, ambient: null })
  })
  it.each([['idle', 'neutral'], ['focus-running', 'working'], ['focus-paused', 'paused'], ['break-running', 'onBreak'],
    ['unknown-timer', 'unknown']] as const)('maps %s to factual presence %s', (scenario, expected) => {
    const { source, store, refresh, baseline } = setup()
    source.setScenario(scenario); refresh()
    expect(evaluateExperience(store.getSnapshot(), attention, baseline).intent.presence).toBe(expected)
  })
  it('does not mutate context or prior memory', () => {
    const { store, baseline } = setup()
    const copy = structuredClone(baseline), context = store.getSnapshot(), before = structuredClone(context)
    Object.freeze(baseline); evaluateExperience(context, attention, baseline)
    expect(baseline).toEqual(copy); expect(context).toEqual(before)
  })
})

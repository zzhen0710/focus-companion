import { createExperienceContextStore } from './contextStore'
import type { FactsLoad } from './contextStore'
import { evaluateExperience, initialRuleMemory } from './rules'
import type { Attention } from './rules'
import type { TimerSnapshot } from '../features/focus/timerController'

interface Source<T> { getSnapshot(): T; subscribe(listener: () => void): () => void }
/** Read-only production composition. Microtasks see the settled controller + saved facts together. */
export function createProductionBridge(load: () => FactsLoad, timer: Source<TimerSnapshot>,
  savedChanges: Pick<Source<unknown>, 'subscribe'>, clock: () => number = Date.now) {
  const context = createExperienceContextStore(load, clock)
  let memory = initialRuleMemory()
  let attention: Attention = { visible: false, decisionActive: false, reviewOpen: false, blockingError: false }
  let snapshot = { context: context.getSnapshot(), intent: evaluateExperience(context.getSnapshot(), attention, memory).intent }
  let attached = false, queued = false, savedDirty = true, generation = 0
  const listeners = new Set<() => void>()
  function schedule(saved = false) {
    savedDirty ||= saved
    if (!attached || queued) return
    queued = true
    const currentGeneration = generation
    queueMicrotask(() => {
      if (!attached || generation !== currentGeneration) return
      queued = false
      const current = timer.getSnapshot()
      context.updateLive(current.data ? { status: 'ready', asOf: current.now, value: {
        timer: current.data.timer, settings: current.data.settings, pendingCompletion: current.pendingCompletion,
        pendingReset: current.pendingReset, error: current.error,
      } } : { status: 'unavailable', error: current.error ?? 'Timer data is unavailable.' })
      if (savedDirty) { savedDirty = false; context.refreshSaved() }
      else context.tick()
      const state = context.getSnapshot()
      const result = evaluateExperience(state, attention, memory)
      memory = result.nextMemory
      snapshot = { context: state, intent: result.intent }
      listeners.forEach((listener) => listener())
    })
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    attach() {
      attached = true; generation++
      const stopTimer = timer.subscribe(() => schedule()), stopSaved = savedChanges.subscribe(() => schedule(true))
      schedule(true)
      return () => { attached = false; generation++; queued = false; stopTimer(); stopSaved() }
    },
    refresh() { schedule(true) },
    selectTask(id: string | null) { context.selectTask(id); schedule() },
    setAttention(next: Attention) { attention = next; schedule() },
  }
}

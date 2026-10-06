import { localCalendarContext } from '../domain/calendarWindows'
import { projectContext, projectSavedFacts } from './context'
import type { Available, LiveFocus, SavedContext, SavedFacts, TaskIdentity } from './context'

export type FactsLoad = { status: 'ready'; facts: SavedFacts } | { status: 'unavailable'; error: string }

/** A read-only validation coordinator, intentionally unwired from production. */
export function createExperienceContextStore(load: () => FactsLoad, clock: () => number = Date.now) {
  let saved: Available<SavedContext> = { status: 'loading' }
  let tasks: Available<readonly TaskIdentity[]> = { status: 'loading' }
  let live: Available<LiveFocus> = { status: 'loading' }
  let selectedTaskId: string | null = null
  let observedDate = localCalendarContext(clock()).today
  let snapshot = projectContext(saved, tasks, live, selectedTaskId, clock())
  const listeners = new Set<() => void>()
  function publish() {
    snapshot = projectContext(saved, tasks, live, selectedTaskId, clock())
    listeners.forEach((listener) => listener())
  }
  function refreshSaved() {
    const now = clock(), result = load()
    observedDate = localCalendarContext(now).today
    if (result.status === 'ready') {
      saved = { status: 'ready', value: projectSavedFacts(result.facts, now), asOf: now }
      // Copy only lookup facts; no raw document is retained or exposed.
      tasks = { status: 'ready', value: result.facts.tasks.map(({ id, title, status }) => ({ id, title, status })), asOf: now }
    } else {
      saved = saved.status === 'ready' || saved.status === 'stale'
        ? { ...saved, status: 'stale', error: result.error } : { status: 'unavailable', error: result.error }
      tasks = tasks.status === 'ready' || tasks.status === 'stale'
        ? { ...tasks, status: 'stale', error: result.error } : { status: 'unavailable', error: result.error }
    }
    publish()
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    refreshSaved,
    updateLive(value: Available<LiveFocus>) { live = value; publish() },
    selectTask(id: string | null) { selectedTaskId = id; publish() },
    tick() {
      const now = clock()
      if (localCalendarContext(now).today !== observedDate) refreshSaved()
      else publish()
    },
  }
}
export type ExperienceContextStore = ReturnType<typeof createExperienceContextStore>

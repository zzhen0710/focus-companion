import type { AppStorage } from '../../storage/storage'
import { localCalendarContext } from '../../domain/calendarWindows'
import type { CalendarContext, InsightPeriod } from '../../domain/calendarWindows'
import { queryInsights } from '../../domain/insights'
import type { InsightFacts } from '../../domain/insights'

export interface InsightsSnapshot { facts: InsightFacts | null; context: CalendarContext; error: string | null }

/** A read-only boundary: no save capability, recovery, or workflow operations. */
export function createInsightsService(storage: Pick<AppStorage, 'load'>, clock: () => number = Date.now) {
  let snapshot: InsightsSnapshot = { facts: null, context: localCalendarContext(clock()), error: null }
  const listeners = new Set<() => void>()
  function reload() {
    const result = storage.load()
    if (result.status === 'ready' && !result.needsMigration) {
      const { tasks, sessions, taskEvents, reviews } = result.data
      snapshot = { facts: { tasks, sessions, taskEvents, reviews }, context: localCalendarContext(clock()), error: null }
    } else {
      snapshot = { ...snapshot, error: 'Insights could not be loaded. Stored data was left untouched.' }
    }
    listeners.forEach((listener) => listener())
  }
  reload()
  return { reload, getSnapshot: () => snapshot,
    query(period: InsightPeriod) { return snapshot.facts ? queryInsights(snapshot.facts, period, snapshot.context) : null },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } } }
}

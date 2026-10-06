import { useMemo, useSyncExternalStore } from 'react'
import { insightsService } from '../../app/services'
import { queryInsights } from '../../domain/insights'
import type { InsightPeriod } from '../../domain/calendarWindows'

export function useInsights(period: InsightPeriod) {
  const snapshot = useSyncExternalStore(insightsService.subscribe, insightsService.getSnapshot)
  const summary = useMemo(() => snapshot.facts ? queryInsights(snapshot.facts, period, snapshot.context) : null, [snapshot, period])
  return { summary, error: snapshot.error }
}

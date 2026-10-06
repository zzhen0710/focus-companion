import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { insightsService } from '../../app/services'
import { attachReadRefresh } from '../../app/readRefresh'
import { queryInsights } from '../../domain/insights'
import type { InsightPeriod } from '../../domain/calendarWindows'

export function useInsights(period: InsightPeriod) {
  const snapshot = useSyncExternalStore(insightsService.subscribe, insightsService.getSnapshot)
  useEffect(() => {
    insightsService.reload()
    return attachReadRefresh(insightsService.reload, document, window)
  }, [])
  const summary = useMemo(() => snapshot.facts ? queryInsights(snapshot.facts, period, snapshot.context) : null, [snapshot, period])
  return { summary, error: snapshot.error }
}

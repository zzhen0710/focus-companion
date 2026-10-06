import { useState } from 'react'
import type { InsightPeriod } from '../../domain/calendarWindows'
import { useInsights } from './useInsights'
import InsightsView from './InsightsView'
import { insightsService } from '../../app/services'
import type { InsightView } from './InsightsView'

export default function InsightsPage({ period: controlledPeriod, onPeriodChange, focused, view, onView, index, onIndex }: { period?: InsightPeriod; onPeriodChange?: (period: InsightPeriod) => void; focused?: boolean; view?: InsightView; onView?: (view: InsightView) => void; index?: number; onIndex?: (index: number) => void } = {}) {
  const [localPeriod, setLocalPeriod] = useState<InsightPeriod>('today')
  const period = controlledPeriod ?? localPeriod, setPeriod = onPeriodChange ?? setLocalPeriod
  const { summary, error } = useInsights(period)
  return <InsightsView period={period} onPeriodChange={setPeriod} summary={summary} error={error} onRetry={insightsService.reload} focused={focused} view={view} onView={onView} index={index} onIndex={onIndex} />
}

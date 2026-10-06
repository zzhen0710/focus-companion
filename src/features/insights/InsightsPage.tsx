import { useState } from 'react'
import type { InsightPeriod } from '../../domain/calendarWindows'
import { useInsights } from './useInsights'
import InsightsView from './InsightsView'
import { insightsService } from '../../app/services'

export default function InsightsPage() {
  const [period, setPeriod] = useState<InsightPeriod>('today')
  const { summary, error } = useInsights(period)
  return <InsightsView period={period} onPeriodChange={setPeriod} summary={summary} error={error} onRetry={insightsService.reload} />
}

import { useState } from 'react'
import type { HistoryPeriod } from '../../domain/calendarWindows'
import { useHistory } from './useHistory'
import HistoryView from './HistoryView'

export default function HistoryPage() {
  const [period, setPeriod] = useState<HistoryPeriod>('all')
  const snapshot = useHistory()
  return <HistoryView snapshot={snapshot} period={period} onPeriodChange={setPeriod} />
}

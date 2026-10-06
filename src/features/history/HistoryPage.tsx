import { useState } from 'react'
import type { HistoryPeriod } from '../../domain/calendarWindows'
import { useHistory } from './useHistory'
import HistoryView from './HistoryView'

export default function HistoryPage({ period: controlledPeriod, onPeriodChange, focused, index, onIndex }: { period?: HistoryPeriod; onPeriodChange?: (period: HistoryPeriod) => void; focused?: boolean; index?: number; onIndex?: (index: number) => void } = {}) {
  const [localPeriod, setLocalPeriod] = useState<HistoryPeriod>('all')
  const period = controlledPeriod ?? localPeriod, setPeriod = onPeriodChange ?? setLocalPeriod
  const snapshot = useHistory()
  return <HistoryView snapshot={snapshot} period={period} onPeriodChange={setPeriod} focused={focused} index={index} onIndex={onIndex} />
}

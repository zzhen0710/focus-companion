import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import HistoryView from './HistoryView'
import { groupHistory, historyEntries } from '../../domain/history'
import { createDefaultData } from '../../storage/storage'

describe('basic History period presentation', () => {
  it('defaults to All time with only approved filters and preserves entry details', () => {
    const data = createDefaultData(), referenceTime = new Date(2026, 9, 6, 12).getTime()
    data.sessions.push({ id: 'old', taskId: null, categoryId: null, taskTitleSnapshot: null, outcome: 'completed',
      startedAt: referenceTime - 86400000, endedAt: referenceTime - 86400000, durationSeconds: 60, plannedDurationSeconds: 60 })
    const snapshot = { groups: groupHistory(historyEntries(data)), referenceTime, error: null }
    const html = renderToStaticMarkup(<HistoryView snapshot={snapshot} period="all" onPeriodChange={() => {}} />)
    expect([...html.matchAll(/<option[^>]*>([^<]+)<\/option>/g)].map((match) => match[1])).toEqual(['All time', 'Today', 'This week', 'Last 7 days'])
    expect(html).toContain('<option value="all" selected="">All time')
    expect(html).toContain('60 seconds focused / 60 seconds planned')
    const today = renderToStaticMarkup(<HistoryView snapshot={snapshot} period="today" onPeriodChange={() => {}} />)
    expect(today).toContain('No entries in this period.')
    expect(today).not.toContain('No history yet.')
  })
  it('distinguishes empty history from a read failure', () => {
    const snapshot = { groups: [], referenceTime: 0, error: null }
    expect(renderToStaticMarkup(<HistoryView snapshot={snapshot} period="all" onPeriodChange={() => {}} />)).toContain('No history yet.')
    const failed = renderToStaticMarkup(<HistoryView snapshot={{ ...snapshot, error: 'History could not be loaded.' }} period="all" onPeriodChange={() => {}} />)
    expect(failed).toContain('History could not be loaded.')
    expect(failed).not.toContain('No history yet.')
  })
})

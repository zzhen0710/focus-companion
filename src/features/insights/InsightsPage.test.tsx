import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import InsightsView from './InsightsView'
import { queryInsights } from '../../domain/insights'
import { localCalendarContext } from '../../domain/calendarWindows'
import { createDefaultData } from '../../storage/storage'

const context = localCalendarContext(new Date(2026, 9, 6, 12).getTime())
describe('restrained Insights presentation', () => {
  it('renders approved periods, separate Now facts, zero values and null metrics', () => {
    const summary = queryInsights(createDefaultData(), 'today', context)
    const html = renderToStaticMarkup(<InsightsView period="today" onPeriodChange={() => {}} summary={summary} error={null} onRetry={() => {}} />)
    expect([...html.matchAll(/<option[^>]*>([^<]+)<\/option>/g)].map((match) => match[1])).toEqual(['Today', 'This week', 'Last 7 days'])
    expect(html).toContain('<option value="today" selected="">Today')
    for (const label of ['Focus', 'Focused', 'Completed sessions', 'Interrupted sessions', 'Sessions', 'Completion rate', 'Average session', 'Now',
      'Open tasks', 'Overdue tasks', 'Task activity', 'Task completions', 'Moved', 'Dropped', 'Review', 'Reviews completed',
      'Task completions through Review', 'Moved through Review', 'Dropped through Review', 'Focus · Last 7 days', 'Task focus']) expect(html).toContain(`>${label}<`)
    expect(html).toContain('<dt>Completion rate</dt><dd>—</dd>')
    expect(html).toContain('<dt>Average session</dt><dd>—</dd>')
    expect(html).toContain('<dt>Focused</dt><dd>0s</dd>')
    expect(html.match(/<time /g)).toHaveLength(7)
    expect(html).toContain('No recorded Focus in this period.')
    expect(html).not.toContain('Tasks completed')
    expect(html).not.toContain('<dt>Completed</dt>')
    expect(html).not.toContain('<dt>Interrupted</dt>')
    expect(html).toContain('0 completed sessions · 0 interrupted sessions')
  })
  it('shows actual durations, rates, and truthful historical fallbacks', () => {
    const data = createDefaultData()
    data.sessions = [
      { id: 'one', taskId: 'deleted', categoryId: null, taskTitleSnapshot: null, startedAt: context.now - 900000,
        endedAt: context.now, durationSeconds: 65, plannedDurationSeconds: 1500, outcome: 'completed' },
      { id: 'two', taskId: null, categoryId: null, taskTitleSnapshot: null, startedAt: context.now - 60000,
        endedAt: context.now, durationSeconds: 10, plannedDurationSeconds: 1500, outcome: 'interrupted' },
    ]
    const html = renderToStaticMarkup(<InsightsView period="week" onPeriodChange={() => {}}
      summary={queryInsights(data, 'week', context)} error={null} onRetry={() => {}} />)
    expect(html).toContain('<dt>Focused</dt><dd>1m 15s</dd>')
    expect(html).toContain('<dt>Completion rate</dt><dd>50%</dd>')
    expect(html).toContain('<dt>Average session</dt><dd>37.5s</dd>')
    expect(html).toContain('Unknown historical task'); expect(html).toContain('No task')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('1 completed session · 1 interrupted session')
    expect(html).toContain('1 completed session · 0 interrupted sessions')
    expect(html).toContain('0 completed sessions · 1 interrupted session')
  })
  it('uses plural session nouns for daily and per-Task outcomes', () => {
    const data = createDefaultData()
    data.sessions = Array.from({ length: 4 }, (_, index) => ({ id: String(index), taskId: 'task', categoryId: null,
      taskTitleSnapshot: 'Task', startedAt: context.now - 1000, endedAt: context.now, durationSeconds: 1,
      plannedDurationSeconds: 1, outcome: index < 2 ? 'completed' as const : 'interrupted' as const }))
    const html = renderToStaticMarkup(<InsightsView period="today" onPeriodChange={() => {}}
      summary={queryInsights(data, 'today', context)} error={null} onRetry={() => {}} />)
    expect(html.match(/2 completed sessions · 2 interrupted sessions/g)).toHaveLength(2)
  })
  it('does not present load failure as zero statistics and identifies retained results', () => {
    const render = (summary: ReturnType<typeof queryInsights> | null) => renderToStaticMarkup(<InsightsView period="today"
      onPeriodChange={() => {}} summary={summary} error="Insights could not be loaded." onRetry={() => {}} />)
    expect(render(null)).not.toContain('<dt>Focused</dt>')
    expect(render(null)).toContain('Retry loading')
    expect(render(queryInsights(createDefaultData(), 'today', context))).toContain('Showing the last loaded results.')
  })
})

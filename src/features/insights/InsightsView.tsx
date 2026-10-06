import type { InsightPeriod } from '../../domain/calendarWindows'
import type { InsightsSummary } from '../../domain/insights'
import './InsightsPage.css'
import Pagination from '../../scene/Pagination'
import { selectedPage } from '../../scene/pageSelection'

export type InsightView = 'focus' | 'tasks' | 'review' | 'trend' | 'taskFocus'

function duration(seconds: number): string {
  const rounded = Math.round(seconds * 10) / 10
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remainder = Math.round((rounded % 60) * 10) / 10
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', remainder || !rounded ? `${remainder}s` : ''].filter(Boolean).join(' ')
}

function Metrics({ values }: { values: [string, string | number][] }) {
  return <dl className="insights-metrics">{values.map(([label, value]) => <div key={label}>
    <dt>{label}</dt><dd>{value}</dd>
  </div>)}</dl>
}

function sessionOutcome(count: number, outcome: 'completed' | 'interrupted'): string {
  return `${count} ${outcome} session${count === 1 ? '' : 's'}`
}

export default function InsightsView({ period, onPeriodChange, summary, error, onRetry, focused = false, view = 'focus', onView = () => {}, index = 0, onIndex = () => {} }: {
  period: InsightPeriod
  onPeriodChange(period: InsightPeriod): void
  summary: InsightsSummary | null
  error: string | null
  onRetry(): void
  focused?: boolean; view?: InsightView; onView?: (view: InsightView) => void; index?: number; onIndex?: (index: number) => void
}) {
  const maxFocused = Math.max(1, ...summary?.trend.map((point) => point.focusedSeconds) ?? [])
  return <section className="page insights-page" aria-labelledby="insights-heading">
    <h1 id="insights-heading">Insights</h1>
    <label>Period<select value={period} onChange={(event) => onPeriodChange(event.target.value as InsightPeriod)}>
      <option value="today">Today</option><option value="week">This week</option><option value="last7days">Last 7 days</option>
    </select></label>
    {focused && <nav className="bubble-subviews" aria-label="Insights views">{(['focus', 'tasks', 'review', 'trend', 'taskFocus'] as const).map((item) =>
      <button key={item} aria-pressed={view === item} onClick={() => { onView(item); onIndex(0) }}>{({ focus: 'Focus', tasks: 'Tasks', review: 'Review', trend: 'Trend', taskFocus: 'Task focus' })[item]}</button>)}</nav>}
    {error && <div><p role="status">{error}</p>{summary && <p>Showing the last loaded results.</p>}
      <button type="button" onClick={onRetry}>Retry loading</button></div>}
    {summary && <>
      {(!focused || view === 'focus') && <section aria-labelledby="insights-focus"><h2 id="insights-focus">Focus</h2>
        {!focused && <p>Recorded sessions only. Sessions are attributed to their ending date.</p>}
        <Metrics values={[
          ['Focused', duration(summary.focus.focusedSeconds)], ['Completed sessions', summary.focus.completedCount],
          ['Interrupted sessions', summary.focus.interruptedCount], ['Sessions', summary.focus.sessionCount],
          ['Completion rate', summary.focus.completionRate === null ? '—' : `${Math.round(summary.focus.completionRate * 100)}%`],
          ['Average session', summary.focus.averageSeconds === null ? '—' : duration(summary.focus.averageSeconds)],
        ]} />
      </section>}
      {(!focused || view === 'tasks') && <><section aria-labelledby="insights-now"><h2 id="insights-now">Now</h2>
        <Metrics values={[['Open tasks', summary.tasks.now.openCount], ['Overdue tasks', summary.tasks.now.overdueCount]]} />
      </section>
      <section aria-labelledby="insights-tasks"><h2 id="insights-tasks">Task activity</h2>
        {!focused && <p>Operation counts, including repeated actions. Earlier versions did not record task operations.</p>}
        <Metrics values={[['Task completions', summary.tasks.activity.completions],
          ['Moved', summary.tasks.activity.reschedules], ['Dropped', summary.tasks.activity.drops]]} />
      </section></>}
      {(!focused || view === 'review') && <section aria-labelledby="insights-review"><h2 id="insights-review">Review</h2>
        <Metrics values={[['Reviews completed', summary.review.completedCount],
          ['Task completions through Review', summary.review.actions.completions], ['Moved through Review', summary.review.actions.reschedules],
          ['Dropped through Review', summary.review.actions.drops]]} />
      </section>}
      {(!focused || view === 'trend') && <section aria-labelledby="insights-trend"><h2 id="insights-trend">Focus · Last 7 days</h2>
        <ul className="insights-trend">{(focused ? summary.trend.slice(selectedPage(index, summary.trend.length), selectedPage(index, summary.trend.length) + 1) : summary.trend).map((point) => <li key={point.date}>
          <time dateTime={point.date}>{point.date}</time><span>{duration(point.focusedSeconds)}</span>
          <span>{sessionOutcome(point.completedCount, 'completed')} · {sessionOutcome(point.interruptedCount, 'interrupted')}</span>
          <span className="insights-bar" aria-hidden="true" style={{ width: `${point.focusedSeconds / maxFocused * 100}%` }} />
        </li>)}</ul>
        {focused && <Pagination index={index} count={summary.trend.length} onChange={onIndex} label="Focus days" />}
      </section>}
      {(!focused || view === 'taskFocus') && <section aria-labelledby="insights-task-focus"><h2 id="insights-task-focus">Task focus</h2>
        {!focused && <p>Historical titles captured at Focus start.</p>}
        {!summary.taskFocus.length && <p>No recorded Focus in this period.</p>}
        <ul className="insights-task-focus">{(focused ? summary.taskFocus.slice(selectedPage(index, summary.taskFocus.length), selectedPage(index, summary.taskFocus.length) + 1) : summary.taskFocus).map((task) => <li key={JSON.stringify(task.taskId)}>
          <span className="insights-task-title" title={task.title}>{task.title}</span><span>{duration(task.focusedSeconds)} focused · {task.sessionCount} sessions</span>
          <span>{sessionOutcome(task.completedCount, 'completed')} · {sessionOutcome(task.interruptedCount, 'interrupted')}</span>
        </li>)}</ul>
        {focused && <Pagination index={index} count={summary.taskFocus.length} onChange={onIndex} label="Task Focus groups" />}
      </section>}
    </>}
  </section>
}

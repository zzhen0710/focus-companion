import { filterHistory } from '../../domain/history'
import { localCalendarContext } from '../../domain/calendarWindows'
import type { HistoryPeriod } from '../../domain/calendarWindows'
import type { createHistoryService } from './historyService'
import type { HistoryEntry } from '../../domain/history'
import { scheduleLabel } from '../../domain/taskSchedule'
import Pagination from '../../scene/Pagination'
import { selectedPage } from '../../scene/pageSelection'

function Detail({ entry }: { entry: HistoryEntry }) {
  if (entry.kind === 'focus') {
    const session = entry.record
    return <><h2>Focus {session.outcome}</h2><p title={session.taskTitleSnapshot ?? undefined}>{session.taskTitleSnapshot ?? (session.taskId ? 'Unknown historical task title' : 'No task')}</p>
      <p>{session.durationSeconds} seconds focused / {session.plannedDurationSeconds} seconds planned</p></>
  }
  if (entry.kind === 'review') return <><h2>Daily Review complete</h2><p>{entry.summary.reviewed} tasks reviewed ·
    {' '}{entry.summary.completed} completed · {entry.summary.moved} moved · {entry.summary.dropped} dropped</p></>
  const event = entry.record
  const labels = { taskCompleted: 'Task completed', taskDropped: 'Task dropped', taskReopened: 'Task reopened', taskRescheduled: 'Task rescheduled' }
  return <><h2>{labels[event.type]}</h2><p title={event.taskSnapshot.title}>{event.taskSnapshot.title}</p>
    <p>{event.type === 'taskRescheduled' ? `${scheduleLabel(event.previousSchedule)} → ` : ''}{scheduleLabel(event.taskSnapshot.schedule)}</p>
    {event.type === 'taskReopened' && <p>Previously {event.previousStatus}</p>}</>
}
export default function HistoryView({ snapshot, period, onPeriodChange, focused = false, index = 0, onIndex = () => {} }: {
  snapshot: ReturnType<ReturnType<typeof createHistoryService>['getSnapshot']>
  period: HistoryPeriod
  onPeriodChange(period: HistoryPeriod): void
  focused?: boolean; index?: number; onIndex?: (index: number) => void
}) {
  const groups = filterHistory(snapshot.groups, period, localCalendarContext(snapshot.referenceTime))
  const entries = groups.flatMap((group) => group.entries)
  return <section className="page" aria-labelledby="history-heading"><h1 id="history-heading">History</h1>
    {!focused && <p>Recorded outcomes. Current task edits do not rewrite these facts.</p>}
    <label>Period<select value={period} onChange={(event) => onPeriodChange(event.target.value as HistoryPeriod)}>
      <option value="all">All time</option><option value="today">Today</option>
      <option value="week">This week</option><option value="last7days">Last 7 days</option>
    </select></label>
    {snapshot.error && <p role="status">{snapshot.error}</p>}
    {!snapshot.error && !groups.length && <p>{snapshot.groups.length ? 'No entries in this period.' : 'No history yet.'}</p>}
    {snapshot.error && snapshot.groups.length > 0 && <p>Showing the last loaded history.</p>}
    {focused ? <>{entries.slice(selectedPage(index, entries.length), selectedPage(index, entries.length) + 1).map((entry) => <article className="history-item" key={`${entry.kind}:${entry.id}`}>
      <time dateTime={new Date(entry.occurredAt).toISOString()}>{new Date(entry.occurredAt).toLocaleString()}</time><Detail entry={entry} />
    </article>)}<Pagination index={index} count={entries.length} onChange={onIndex} label="history entries" /></> : groups.map((group) => <section key={group.date} aria-label={group.date}><h2>{group.date}</h2><ul className="task-list">
      {group.entries.map((entry) => <li className="task-card" key={`${entry.kind}:${entry.id}`}>
        <time dateTime={new Date(entry.occurredAt).toISOString()}>{new Date(entry.occurredAt).toLocaleTimeString()}</time>
        <Detail entry={entry} />
      </li>)}
    </ul></section>)}
  </section>
}

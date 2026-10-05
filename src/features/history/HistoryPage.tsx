import { useHistory } from './useHistory'
import type { HistoryEntry } from '../../domain/history'
import { scheduleLabel } from '../../domain/taskSchedule'

function Detail({ entry }: { entry: HistoryEntry }) {
  if (entry.kind === 'focus') {
    const session = entry.record
    return <><h2>Focus {session.outcome}</h2><p>{session.taskTitleSnapshot ?? (session.taskId ? 'Unknown historical task title' : 'No task')}</p>
      <p>{session.durationSeconds} seconds focused / {session.plannedDurationSeconds} seconds planned</p></>
  }
  if (entry.kind === 'review') return <><h2>Daily Review complete</h2><p>{entry.summary.reviewed} tasks reviewed ·
    {' '}{entry.summary.completed} completed · {entry.summary.moved} moved · {entry.summary.dropped} dropped</p></>
  const event = entry.record
  const labels = { taskCompleted: 'Task completed', taskDropped: 'Task dropped', taskReopened: 'Task reopened', taskRescheduled: 'Task rescheduled' }
  return <><h2>{labels[event.type]}</h2><p>{event.taskSnapshot.title}</p>
    <p>{event.type === 'taskRescheduled' ? `${scheduleLabel(event.previousSchedule)} → ` : ''}{scheduleLabel(event.taskSnapshot.schedule)}</p>
    {event.type === 'taskReopened' && <p>Previously {event.previousStatus}</p>}</>
}
export default function HistoryPage() {
  const snapshot = useHistory()
  return <section className="page" aria-labelledby="history-heading"><h1 id="history-heading">History</h1>
    <p>Recorded outcomes. Current task edits do not rewrite these facts.</p>
    {snapshot.error && <p role="status">{snapshot.error}</p>}
    {!snapshot.groups.length && <p>No history yet.</p>}
    {snapshot.groups.map((group) => <section key={group.date} aria-label={group.date}><h2>{group.date}</h2><ul className="task-list">
      {group.entries.map((entry) => <li className="task-card" key={`${entry.kind}:${entry.id}`}>
        <time dateTime={new Date(entry.occurredAt).toISOString()}>{new Date(entry.occurredAt).toLocaleTimeString()}</time>
        <Detail entry={entry} />
      </li>)}
    </ul></section>)}
  </section>
}

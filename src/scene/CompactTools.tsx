import type { UtilityTool } from '../experience/utilityState'
import type { TimerController, TimerSnapshot } from '../features/focus/timerController'
import type { TaskSnapshot } from '../features/tasks/taskService'
import type { createReviewService } from '../features/review/reviewService'
import type { createHistoryService } from '../features/history/historyService'
import type { InsightsSummary } from '../domain/insights'
import { modeLabels, remainingMs } from '../domain/timer'
import { isReviewEligible, reviewQueue } from '../domain/dailyReview'
import { localCalendarDate } from '../domain/taskSchedule'

type ReviewSnapshot = ReturnType<ReturnType<typeof createReviewService>['getSnapshot']>
type HistorySnapshot = ReturnType<ReturnType<typeof createHistoryService>['getSnapshot']>
/** Deliberately reduced views, never scaled full workflows. Review receives no commands. */
export default function CompactTools({ tool, timer, controller, tasks, review, history, insights, error, onPromote, onRetry }: {
  tool: UtilityTool; timer: TimerSnapshot; controller: TimerController; tasks: TaskSnapshot; review: ReviewSnapshot
  history: HistorySnapshot; insights: InsightsSummary | null; error: string | null; onPromote(): void; onRetry(): void
}) {
  const open = tasks.data?.tasks.filter((task) => task.status === 'open') ?? []
  const overdue = open.filter((task) => isReviewEligible(task, localCalendarDate(timer.now)))
  const pending = review.data ? review.data.activeReview
    ? reviewQueue(review.data.tasks, review.data.taskEvents, review.data.activeReview, review.today)
    : review.data.tasks.filter((task) => isReviewEligible(task, review.today)) : []
  const current = timer.data?.timer
  const seconds = timer.data ? Math.ceil(remainingMs(timer.data.timer, timer.data.settings, timer.now) / 1000) : null
  const latest = history.groups[0]?.entries[0]
  return <div className="compact-tool" data-compact-tool={tool}>
    {error ? <div role="status"><p>{error}</p>{tool !== 'review' && <button data-retry onClick={onRetry}>Retry</button>}</div> : <>
      {tool === 'focus' && <>
        <p>{current ? `${modeLabels[current.mode]} · ${current.status}` : 'Timer unavailable'}</p>
        <output role="timer" aria-live="off">{seconds === null ? '—' : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</output>
        <p className="one-line" title={current && 'taskTitleSnapshot' in current ? current.taskTitleSnapshot ?? '' : ''}>
          {current && 'taskTitleSnapshot' in current ? current.taskTitleSnapshot ?? (current.taskId ? 'Unknown captured title' : 'No task') : 'No active target'}</p>
        {(current?.status === 'running' || current?.status === 'paused') && <button disabled={!!timer.error}
          onClick={() => current.status === 'running' ? controller.pause() : controller.resume()}>{current.status === 'running' ? 'Pause' : 'Resume'}</button>}
      </>}
      {tool === 'tasks' && <><p>{tasks.data ? `${open.length} open · ${overdue.length} overdue` : 'Tasks unavailable'}</p>
        <p className="one-line" title={(overdue[0] ?? open[0])?.title}>{(overdue[0] ?? open[0])?.title ?? 'No open tasks'}</p></>}
      {tool === 'review' && <><p>{review.data ? `${pending.length} pending` : 'Review unavailable'}</p>
        <p className="one-line" title={pending[0]?.title}>{pending[0]?.title ?? 'No pending work'}</p></>}
      {tool === 'history' && <>{latest ? <><p>{latest.kind === 'focus' ? `Focus ${latest.record.outcome}` : latest.kind === 'review' ? 'Review completed' : 'Task activity'}</p>
        <time dateTime={new Date(latest.occurredAt).toISOString()}>{new Date(latest.occurredAt).toLocaleDateString()}</time></> : <p>No recorded history</p>}</>}
      {tool === 'insights' && <>{insights ? <dl><dt>Focused</dt><dd>{Math.round(insights.focus.focusedSeconds / 60)} min</dd>
        <dt>Task completions</dt><dd>{insights.tasks.activity.completions}</dd></dl> : <p>Insights unavailable</p>}</>}
    </>}
    <button type="button" onClick={onPromote}>Open full {tool}</button>
  </div>
}

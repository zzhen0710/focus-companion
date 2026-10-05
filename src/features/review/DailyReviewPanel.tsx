import { useEffect, useRef, useState } from 'react'
import type { createReviewService } from './reviewService'
import { reviewQueue, reviewSummary } from '../../domain/dailyReview'
import { scheduleLabel } from '../../domain/taskSchedule'
import TaskForm from '../tasks/TaskForm'

type ReviewService = ReturnType<typeof createReviewService>
export default function DailyReviewPanel({ snapshot, service }: { snapshot: ReturnType<ReviewService['getSnapshot']>; service: ReviewService }) {
  const [movingId, setMovingId] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (snapshot.visible) heading.current?.focus() }, [snapshot.visible])
  if (!snapshot.visible || !snapshot.data) return null
  const data = snapshot.data, draft = data.activeReview
  const queue = draft ? reviewQueue(data.tasks, data.taskEvents, draft, snapshot.today) : []
  const summary = snapshot.summary ? reviewSummary(data.taskEvents, snapshot.summary.id) : null
  return <section className="task-card review-panel" aria-labelledby="review-heading">
    <h2 id="review-heading" ref={heading} tabIndex={-1}>{summary && !draft ? 'Daily Review complete' : 'Daily Review'}</h2>
    <p>Resolve past planned work, or dismiss and return later. Focus continues normally.</p>
    <button onClick={service.dismiss}>Dismiss review</button>
    <p role="status">{snapshot.error}</p>
    {summary && !draft && <p role="status">{summary.reviewed} tasks reviewed · {summary.completed} completed · {summary.moved} moved · {summary.dropped} dropped</p>}
    {!queue.length && !summary && <p>No pending tasks in this review.</p>}
    {queue.map((task) => <div className="task-card" key={task.id}><h3>{task.title}</h3><p>{scheduleLabel(task.schedule)}</p>
      <div className="task-actions">
        <button disabled={!!snapshot.error} onClick={() => draft && service.resolve(draft.id, task.id, { type: 'complete' })}>Complete {task.title}</button>
        <button disabled={!!snapshot.error} onClick={() => setMovingId(task.id)}>Move {task.title}</button>
        <button disabled={!!snapshot.error} onClick={() => draft && service.resolve(draft.id, task.id, { type: 'drop' })}>Drop {task.title}</button>
      </div>
      {movingId === task.id && draft && <TaskForm task={task} categories={data.categories} today={snapshot.today} disabled={!!snapshot.error} scheduleOnly
        onSave={(input) => service.resolve(draft.id, task.id, { type: 'move', schedule: input.schedule })
          ? { ok: true, id: task.id } : { ok: false, message: service.getSnapshot().error ?? 'Task is no longer pending. Reload the review.' }}
        onClose={() => setMovingId(null)} />}
    </div>)}
  </section>
}

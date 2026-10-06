import { useState } from 'react'
import type { createReviewService } from './reviewService'
import { reviewQueue, reviewSummary } from '../../domain/dailyReview'
import { scheduleLabel } from '../../domain/taskSchedule'
import TaskForm from '../tasks/TaskForm'
import { openTaskEditor } from '../../app/toolPresentation'
import type { TaskEditor } from '../../app/toolPresentation'
import Pagination from '../../scene/Pagination'
import { selectedPage } from '../../scene/pageSelection'

type ReviewService = ReturnType<typeof createReviewService>
export default function DailyReviewPanel({ snapshot, service, editor: controlledEditor, onEditor, index = 0, onIndex = () => {} }: { snapshot: ReturnType<ReviewService['getSnapshot']>; service: ReviewService; editor?: TaskEditor | null; onEditor?: (editor: TaskEditor | null) => void; index?: number; onIndex?: (index: number) => void }) {
  const [localEditor, setLocalEditor] = useState<TaskEditor | null>(null)
  const editor = controlledEditor === undefined ? localEditor : controlledEditor
  const setEditor = onEditor ?? setLocalEditor
  if (!snapshot.data) return null
  const data = snapshot.data, draft = data.activeReview
  const queue = draft ? reviewQueue(data.tasks, data.taskEvents, draft, snapshot.today) : []
  const summary = snapshot.summary ? reviewSummary(data.taskEvents, snapshot.summary.id) : null
  return <section className="task-card review-panel" aria-labelledby="review-heading">
    <h2 id="review-heading" className="scene-sr-only">{summary && !draft ? 'Daily Review complete' : 'Daily Review'}</h2>

    <p role="status">{snapshot.error}</p>
    {summary && !draft && <p role="status">{summary.reviewed} tasks reviewed · {summary.completed} completed · {summary.moved} moved · {summary.dropped} dropped</p>}
    {!queue.length && !summary && <p>No pending tasks in this review.</p>}
    {!editor && queue.slice(selectedPage(index, queue.length), selectedPage(index, queue.length) + 1).map((task) => <div className="task-card" key={task.id}><h3 className="one-line" title={task.title}>{task.title}</h3><p>{scheduleLabel(task.schedule)}</p>
      <div className="task-actions">
        <button disabled={!!snapshot.error} onClick={() => draft && service.resolve(draft.id, task.id, { type: 'complete' })}>Complete {task.title}</button>
        <button disabled={!!snapshot.error} onClick={() => setEditor(openTaskEditor(task))}>Move {task.title}</button>
        <button disabled={!!snapshot.error} onClick={() => draft && service.resolve(draft.id, task.id, { type: 'drop' })}>Drop {task.title}</button>
      </div>

    </div>)}
    {!editor && queue.length > 0 && <Pagination index={index} count={queue.length} onChange={onIndex} label="review items" />}
    {editor?.task && <>
      {!queue.some((task) => task.id === editor.task!.id) && <p role="status">This task is no longer pending in this review. Your schedule draft is kept; cancel when ready.</p>}
      <TaskForm focused key={editor.instance} task={editor.task} draft={editor.draft} onDraft={(draft) => setEditor({ ...editor, draft })}
        categories={data.categories} today={snapshot.today} disabled={!!snapshot.error || !draft || !queue.some((task) => task.id === editor.task!.id)} scheduleOnly
        onSave={(input) => draft && service.resolve(draft.id, editor.task!.id, { type: 'move', schedule: input.schedule })
          ? { ok: true, id: editor.task!.id } : { ok: false, message: service.getSnapshot().error ?? 'Task is no longer pending. Reload the review.' }}
        onClose={() => { setEditor(null); requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-tool-heading="review"]')?.focus()) }} />
    </>}
  </section>
}

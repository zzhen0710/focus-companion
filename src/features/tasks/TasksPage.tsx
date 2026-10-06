import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { localCalendarDate, scheduleLabel } from '../../domain/taskSchedule'
import { tasksInWorkspace, taskViewPreferences } from './taskViewPreferences'
import type { TaskView, TaskStatusFilter } from './taskViewPreferences'
import type { TaskResult, TaskService, TaskSnapshot } from './taskService'
import TaskForm from './TaskForm'
import './TasksPage.css'
import { openTaskEditor, editorConflict } from '../../app/toolPresentation'
import type { TaskEditor } from '../../app/toolPresentation'
import Pagination from '../../scene/Pagination'
import { selectedPage } from '../../scene/pageSelection'

export default function TasksPage({ snapshot, service, now, editor: controlledEditor, onEditor, onDecisionChange, focused = false, index = 0, onIndex = () => {} }: { snapshot: TaskSnapshot; service: TaskService; now: number; editor?: TaskEditor | null; onEditor?: (editor: TaskEditor | null) => void; onDecisionChange?: (active: boolean) => void; focused?: boolean; index?: number; onIndex?: (index: number) => void }) {
  const newTaskButton = useRef<HTMLButtonElement>(null)
  const [localEditor, setLocalEditor] = useState<TaskEditor | null>(null)
  const editor = controlledEditor === undefined ? localEditor : controlledEditor
  const setEditor = (value: TaskEditor | null) => { if (onEditor) onEditor(value); else setLocalEditor(value) }
  const workspace = useSyncExternalStore(taskViewPreferences.subscribe, taskViewPreferences.getSnapshot, taskViewPreferences.getSnapshot)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [formDecision, setFormDecision] = useState(false)
  useEffect(() => { onDecisionChange?.(!!confirmDelete || formDecision); return () => onDecisionChange?.(false) }, [confirmDelete, formDecision, onDecisionChange])
  const data = snapshot.data
  const disabled = !!snapshot.error
  const conflict = editorConflict(editor, data?.tasks ?? [])
  const today = localCalendarDate(now)
  const tasks = tasksInWorkspace(data?.tasks ?? [], workspace, today)
  const pageIndex = selectedPage(index, tasks.length)
  const shown = focused ? tasks.slice(pageIndex, pageIndex + 1) : tasks
  const canMove = workspace.view === 'all' && workspace.status === 'all'
  function report(result: TaskResult, success: string) { setMessage(result.ok ? success : result.message) }
  function leaveDecision() { setConfirmDelete(null); setMessage('') }
  return <section className="page tasks-page" onKeyDown={(event) => {
    if (event.key === 'Escape' && confirmDelete && !event.defaultPrevented && (event.target as HTMLElement).tagName !== 'SELECT') {
      event.preventDefault(); event.stopPropagation(); const id = confirmDelete; setConfirmDelete(null); setMessage('')
      document.getElementById(`delete-${id}`)?.focus()
    }
  }} aria-labelledby="tasks-heading">
    <h1 id="tasks-heading">Tasks</h1>
    <p className="page-intro">Plan one actionable thing. Past unfinished tasks remain in All.</p>
    {(!focused || !editor) && <button ref={newTaskButton} type="button" disabled={disabled || !data} onClick={() => { leaveDecision(); setEditor(openTaskEditor(null)) }}>New task</button>}
    {editor && data && <>
      {conflict && <p role="status">{conflict}</p>}
      <TaskForm focused={focused} key={editor.instance} task={editor.task} draft={editor.draft} view={editor.formView} onView={(formView) => setEditor({ ...editor, formView })}
        onDraft={(draft) => setEditor({ ...editor, draft })} categories={data.categories}
        service={service} tasks={data.tasks} today={today} disabled={disabled || !!conflict} onDecisionChange={setFormDecision}
        onClose={() => { setEditor(null); requestAnimationFrame(() => newTaskButton.current?.focus()) }} />
    </>}
    {(!focused || !editor) && <><div className="task-filters">
      <label>View<select value={workspace.view} onChange={(event) => { leaveDecision(); onIndex(0); taskViewPreferences.set({ view: event.target.value as TaskView }) }}>
        <option value="all">All dates</option><option value="today">Today</option><option value="unscheduled">Unscheduled</option>
      </select></label>
      <label>Status<select value={workspace.status} onChange={(event) => { leaveDecision(); onIndex(0); taskViewPreferences.set({ status: event.target.value as TaskStatusFilter }) }}>
        <option value="all">All tasks</option><option value="open">Open</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
      </select></label>
    </div>
    {workspace.error && <p role="status">{workspace.error}</p>}
    {!confirmDelete && <p role="status">{message}</p>}
    {!tasks.length && <p>No tasks in this view.</p>}
    <ul className="task-list">
      {shown.map((task, shownIndex) => <li className="task-card" key={task.id}>
        <h2 className="one-line" title={task.title}>{task.title}</h2><p>{scheduleLabel(task.schedule)} · {task.status}</p>
        {task.completedAt !== null && task.status === 'completed' && <p>Completed at {new Date(task.completedAt).toLocaleString()}</p>}
        {task.droppedAt !== null && task.status === 'dropped' && <p>Dropped at {new Date(task.droppedAt).toLocaleString()}</p>}
        {!focused && task.content && <p className="task-content">{task.content}</p>}
        {!focused && task.categoryId && <p>Category: {data?.categories.find((category) => category.id === task.categoryId)?.name ?? 'Unavailable category'}</p>}
        <div className="task-actions">
          <button disabled={disabled} onClick={() => report(service.setCompleted(task.id, task.status === 'open'), 'Task saved.')}
            aria-label={`${task.status === 'open' ? 'Complete' : 'Reopen'} ${task.title}`}>{task.status === 'open' ? 'Complete' : 'Reopen'}</button>
          {task.status === 'open' && <button disabled={disabled} onClick={() => report(service.drop(task.id), 'Task dropped.')} aria-label={`Drop ${task.title}`}>Drop</button>}
          <button disabled={disabled} onClick={() => { leaveDecision(); setEditor(openTaskEditor(task)) }} aria-label={`Edit ${task.title}`}>Edit</button>
          <button disabled={disabled} id={`delete-${task.id}`} aria-label={`Delete ${task.title}`} onClick={() => { setConfirmDelete(task.id); setMessage('') }}>Delete</button>
          {canMove && <>
            <button disabled={disabled || (focused ? pageIndex : shownIndex) === 0} aria-label={`Move ${task.title} up`} onClick={() => report(service.move(task.id, 'up'), 'Order saved.')}>Move up</button>
            <button disabled={disabled || (focused ? pageIndex : shownIndex) === tasks.length - 1} aria-label={`Move ${task.title} down`} onClick={() => report(service.move(task.id, 'down'), 'Order saved.')}>Move down</button>
          </>}
        </div>
        {confirmDelete === task.id && <div>
          <p>Delete this task permanently? Existing focus records will remain.</p>
          <p role="status">{message}</p>
          <button autoFocus disabled={disabled} onClick={() => {
            const result = service.delete(task.id)
            report(result, 'Task deleted.')
            if (result.ok) { setConfirmDelete(null); if (editor?.task?.id === task.id) setEditor(null) }
          }}>Confirm deletion</button>
          <button onClick={() => { setConfirmDelete(null); setMessage(''); document.getElementById(`delete-${task.id}`)?.focus() }}>Keep task</button>
        </div>}
      </li>)}
    </ul>
    {focused && <Pagination index={pageIndex} count={tasks.length} onChange={(value) => { leaveDecision(); onIndex(value) }} label="tasks" />}</>}
  </section>
}

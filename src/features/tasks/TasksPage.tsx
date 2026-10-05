import { useRef, useState, useSyncExternalStore } from 'react'
import type { Task } from '../../domain/task'
import { localCalendarDate, scheduleLabel } from '../../domain/taskSchedule'
import { tasksInWorkspace, taskViewPreferences } from './taskViewPreferences'
import type { TaskView, TaskStatusFilter } from './taskViewPreferences'
import type { TaskResult, TaskService, TaskSnapshot } from './taskService'
import TaskForm from './TaskForm'
import './TasksPage.css'

export default function TasksPage({ snapshot, service, now }: { snapshot: TaskSnapshot; service: TaskService; now: number }) {
  const newTaskButton = useRef<HTMLButtonElement>(null)
  const [editor, setEditor] = useState<Task | null | undefined>(undefined)
  const workspace = useSyncExternalStore(taskViewPreferences.subscribe, taskViewPreferences.getSnapshot, taskViewPreferences.getSnapshot)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const data = snapshot.data
  const disabled = !!snapshot.error
  const today = localCalendarDate(now)
  const tasks = tasksInWorkspace(data?.tasks ?? [], workspace, today)
  const canMove = workspace.view === 'all' && workspace.status === 'all'
  function report(result: TaskResult, success: string) { setMessage(result.ok ? success : result.message) }
  return <section className="page tasks-page" aria-labelledby="tasks-heading">
    <h1 id="tasks-heading">Tasks</h1>
    <p className="page-intro">Plan one actionable thing. Past unfinished tasks remain in All.</p>
    <button ref={newTaskButton} type="button" disabled={disabled || !data} onClick={() => { setEditor(null); setMessage('') }}>New task</button>
    {editor !== undefined && data && <TaskForm key={editor?.id ?? 'new'} task={editor} categories={data.categories}
      service={service} tasks={data.tasks} today={today} disabled={disabled} onClose={() => { setEditor(undefined); newTaskButton.current?.focus() }} />}
    <div className="task-filters">
      <label>View<select value={workspace.view} onChange={(event) => taskViewPreferences.set({ view: event.target.value as TaskView })}>
        <option value="all">All dates</option><option value="today">Today</option><option value="unscheduled">Unscheduled</option>
      </select></label>
      <label>Status<select value={workspace.status} onChange={(event) => taskViewPreferences.set({ status: event.target.value as TaskStatusFilter })}>
        <option value="all">All tasks</option><option value="open">Open</option><option value="completed">Completed</option><option value="dropped">Dropped</option>
      </select></label>
    </div>
    {workspace.error && <p role="status">{workspace.error}</p>}
    {!confirmDelete && <p role="status">{message}</p>}
    {!tasks.length && <p>No tasks in this view.</p>}
    <ul className="task-list">
      {tasks.map((task, index) => <li className="task-card" key={task.id}>
        <h2>{task.title}</h2><p>{scheduleLabel(task.schedule)} · {task.status}</p>
        {task.completedAt !== null && task.status === 'completed' && <p>Completed at {new Date(task.completedAt).toLocaleString()}</p>}
        {task.droppedAt !== null && task.status === 'dropped' && <p>Dropped at {new Date(task.droppedAt).toLocaleString()}</p>}
        {task.content && <p className="task-content">{task.content}</p>}
        {task.categoryId && <p>Category: {data?.categories.find((category) => category.id === task.categoryId)?.name ?? 'Unavailable category'}</p>}
        <div className="task-actions">
          <button disabled={disabled} onClick={() => report(service.setCompleted(task.id, task.status === 'open'), 'Task saved.')}
            aria-label={`${task.status === 'open' ? 'Complete' : 'Reopen'} ${task.title}`}>{task.status === 'open' ? 'Complete' : 'Reopen'}</button>
          {task.status === 'open' && <button disabled={disabled} onClick={() => report(service.drop(task.id), 'Task dropped.')} aria-label={`Drop ${task.title}`}>Drop</button>}
          <button disabled={disabled} onClick={() => { setEditor(task); setMessage('') }} aria-label={`Edit ${task.title}`}>Edit</button>
          <button disabled={disabled} aria-label={`Delete ${task.title}`} onClick={() => { setConfirmDelete(task.id); setMessage('') }}>Delete</button>
          {canMove && <>
            <button disabled={disabled || index === 0} aria-label={`Move ${task.title} up`} onClick={() => report(service.move(task.id, 'up'), 'Order saved.')}>Move up</button>
            <button disabled={disabled || index === tasks.length - 1} aria-label={`Move ${task.title} down`} onClick={() => report(service.move(task.id, 'down'), 'Order saved.')}>Move down</button>
          </>}
        </div>
        {confirmDelete === task.id && <div>
          <p>Delete this task permanently? Existing focus records will remain.</p>
          <p role="status">{message}</p>
          <button disabled={disabled} onClick={() => {
            const result = service.delete(task.id)
            report(result, 'Task deleted.')
            if (result.ok) { setConfirmDelete(null); if (editor?.id === task.id) setEditor(undefined) }
          }}>Confirm deletion</button>
          <button onClick={() => { setConfirmDelete(null); setMessage('') }}>Keep task</button>
        </div>}
      </li>)}
    </ul>
  </section>
}

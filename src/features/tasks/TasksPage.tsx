import { useRef, useState } from 'react'
import type { Task } from '../../domain/task'
import { localCalendarDate, matchesCalendarQuery, scheduleLabel } from '../../domain/taskSchedule'
import type { CalendarQuery } from '../../domain/taskSchedule'
import type { TaskResult, TaskService, TaskSnapshot } from './taskService'
import TaskForm from './TaskForm'
import './TasksPage.css'

export default function TasksPage({ snapshot, service, now }: { snapshot: TaskSnapshot; service: TaskService; now: number }) {
  const newTaskButton = useRef<HTMLButtonElement>(null)
  const [editor, setEditor] = useState<Task | null | undefined>(undefined)
  const [query, setQuery] = useState<CalendarQuery>('all')
  const [completion, setCompletion] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const data = snapshot.data
  const disabled = !!snapshot.error
  const today = localCalendarDate(now)
  const tasks = data?.tasks.filter((task) => matchesCalendarQuery(task.schedule, query, today) &&
    (completion === 'all' || task.completed === (completion === 'completed'))) ?? []
  const canMove = query === 'all' && completion === 'all'
  function report(result: TaskResult, success: string) { setMessage(result.ok ? success : result.message) }
  return <section className="page tasks-page" aria-labelledby="tasks-heading">
    <h1 id="tasks-heading">Tasks</h1>
    <p className="page-intro">Plan one actionable thing. Past unfinished tasks remain in All.</p>
    <button ref={newTaskButton} type="button" disabled={disabled || !data} onClick={() => { setEditor(null); setMessage('') }}>New task</button>
    {editor !== undefined && data && <TaskForm key={editor?.id ?? 'new'} task={editor} categories={data.categories}
      service={service} disabled={disabled} onClose={() => { setEditor(undefined); newTaskButton.current?.focus() }} />}
    <div className="task-filters">
      <label>View<select value={query} onChange={(event) => setQuery(event.target.value as CalendarQuery)}>
        <option value="all">All dates</option><option value="today">Today</option><option value="unscheduled">Unscheduled</option>
      </select></label>
      <label>Completion<select value={completion} onChange={(event) => setCompletion(event.target.value)}>
        <option value="all">All tasks</option><option value="open">Open</option><option value="completed">Completed</option>
      </select></label>
    </div>
    {!confirmDelete && <p role="status">{message}</p>}
    {!tasks.length && <p>No tasks in this view.</p>}
    <ul className="task-list">
      {tasks.map((task, index) => <li className="task-card" key={task.id}>
        <h2>{task.title}</h2><p>{scheduleLabel(task.schedule)} · {task.completed ? 'Completed' : 'Open'}</p>
        {task.completedAt !== null && task.completed && <p>Completed at {new Date(task.completedAt).toLocaleString()}</p>}
        {task.content && <p className="task-content">{task.content}</p>}
        {task.categoryId && <p>Category: {data?.categories.find((category) => category.id === task.categoryId)?.name ?? 'Unavailable category'}</p>}
        <div className="task-actions">
          <button disabled={disabled} onClick={() => report(service.setCompleted(task.id, !task.completed), 'Task saved.')}
            aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}>{task.completed ? 'Reopen' : 'Complete'}</button>
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

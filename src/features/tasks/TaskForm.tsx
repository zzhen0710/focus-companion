import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Task, TaskInput } from '../../domain/task'
import type { Category } from '../../domain/category'
import type { TaskSchedule } from '../../domain/taskSchedule'
import type { TaskService, TaskResult } from './taskService'
import { duplicateContext, duplicateTasks, saveTaskDraft } from './taskDuplicates'

export default function TaskForm({ task, categories, service, onClose, disabled, onSave, scheduleOnly = false, tasks = [], today }: {
  task: Task | null; categories: Category[]; service?: TaskService; onClose: () => void; disabled: boolean
  onSave?: (input: TaskInput) => TaskResult; scheduleOnly?: boolean
  tasks?: Task[]; today: string
}) {
  const schedule = task?.schedule ?? { kind: 'unscheduled' }
  const [title, setTitle] = useState(task?.title ?? '')
  const [content, setContent] = useState(task?.content ?? '')
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? '')
  const [kind, setKind] = useState<TaskSchedule['kind']>(schedule.kind)
  const [date, setDate] = useState(schedule.kind === 'date' ? schedule.date : '')
  const [startTime, setStartTime] = useState(schedule.kind === 'date' ? schedule.timeRange?.start ?? '' : '')
  const [endTime, setEndTime] = useState(schedule.kind === 'date' ? schedule.timeRange?.end ?? '' : '')
  const [startDate, setStartDate] = useState(schedule.kind === 'dateRange' ? schedule.startDate : '')
  const [endDate, setEndDate] = useState(schedule.kind === 'dateRange' ? schedule.endDate : '')
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState<{ input: TaskInput; matches: Task[] } | null>(null)
  const titleInput = useRef<HTMLInputElement>(null)
  const matches = task ? [] : duplicateTasks(tasks, title)
  function save(input: TaskInput, createAnyway = false) {
    const result = saveTaskDraft(task, input, service, onSave, createAnyway)
    if ('confirmation' in result) { setConfirmation({ input, matches: result.matches }); setMessage(''); return }
    if (result.ok) onClose()
    else { setConfirmation(null); setMessage(result.message) }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const schedule: TaskSchedule = kind === 'unscheduled' ? { kind }
      : kind === 'dateRange' ? { kind, startDate, endDate }
        : { kind, date, timeRange: startTime || endTime ? { start: startTime, end: endTime } : null }
    const input = { title, content, categoryId: categoryId || null, schedule }
    save(input)
  }
  return <form className="task-editor" onSubmit={submit} noValidate aria-label={task ? 'Edit task' : 'New task'}>
    <h2>{task ? 'Edit task' : 'New task'}</h2>
    <fieldset disabled={disabled || !!confirmation}>
      <legend>Task details</legend>
      {!scheduleOnly && <>
      <label>Title<input ref={titleInput} required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      {matches.length > 0 && <p className="task-duplicate-hint" role="status">
        {matches.length === 1 ? `Same title exists · ${duplicateContext(matches, today)}` : duplicateContext(matches, today)}
      </p>}
      <label>Content (optional)<textarea rows={4} value={content} onChange={(event) => setContent(event.target.value)} /></label>
      {(categories.length > 0 || categoryId) && <label>Category (optional)
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">No category</option>
          {categoryId && !categories.some((category) => category.id === categoryId) && <option value={categoryId}>Unavailable category</option>}
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>}
      </>}
      <label>Schedule<select value={kind} onChange={(event) => setKind(event.target.value as TaskSchedule['kind'])}>
        <option value="unscheduled">Unscheduled</option><option value="date">Specific date</option><option value="dateRange">Date range</option>
      </select></label>
      {kind === 'date' && <>
        <label>Date<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <div className="task-range">
          <label>Start time (optional)<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
          <label>End time (optional)<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label>
        </div><p>Use both times or neither. Time windows stay within one day.</p>
      </>}
      {kind === 'dateRange' && <div className="task-range">
        <label>Start date<input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label>End date<input type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>}
      <button type="submit">{scheduleOnly ? 'Save schedule' : 'Save task'}</button>
    </fieldset>
    {confirmation && <section aria-label="Duplicate task confirmation">
      <p>Same title exists</p><p>{duplicateContext(confirmation.matches, today)}</p><p>Create it anyway?</p>
      <div className="task-actions">
        <button autoFocus type="button" onClick={() => { setConfirmation(null); requestAnimationFrame(() => titleInput.current?.focus()) }}>Back</button>
        <button type="button" disabled={disabled} onClick={() => save(confirmation.input, true)}>Create Anyway</button>
      </div>
    </section>}
    <button type="button" onClick={onClose}>Cancel</button><p role="status">{message}</p>
  </form>
}

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Task, TaskInput } from '../../domain/task'
import type { Category } from '../../domain/category'
import { taskFormDraft, taskDraftInput } from './taskFormDraft'
import type { TaskFormDraft } from './taskFormDraft'
import type { TaskSchedule } from '../../domain/taskSchedule'
import type { TaskService, TaskResult } from './taskService'
import { duplicateContext, duplicateTasks, saveTaskDraft } from './taskDuplicates'

export default function TaskForm({ task, categories, service, onClose, disabled, onSave, scheduleOnly = false, tasks = [], today, draft: controlledDraft, onDraft, onDecisionChange, focused = false, view: controlledView, onView }: {
  task: Task | null; categories: Category[]; service?: TaskService; onClose: () => void; disabled: boolean
  onSave?: (input: TaskInput) => TaskResult; scheduleOnly?: boolean
  tasks?: Task[]; today: string
  draft?: TaskFormDraft; onDraft?: (draft: TaskFormDraft) => void; onDecisionChange?: (active: boolean) => void
  focused?: boolean
  view?: 'details' | 'content' | 'schedule'; onView?: (view: 'details' | 'content' | 'schedule') => void
}) {
  const [localView, setLocalView] = useState<'details' | 'content' | 'schedule'>('details')
  const view = controlledView ?? localView, setView = onView ?? setLocalView
  const [localDraft, setLocalDraft] = useState(() => taskFormDraft(task))
  const draft = controlledDraft ?? localDraft
  const { title, content, categoryId, kind, date, startTime, endTime, startDate, endDate } = draft
  const update = (patch: Partial<TaskFormDraft>) => { const next = { ...draft, ...patch }; if (onDraft) onDraft(next); else setLocalDraft(next) }
  const [message, setMessage] = useState('')
  const [confirmation, setConfirmation] = useState<{ input: TaskInput; matches: Task[] } | null>(null)
  useEffect(() => { onDecisionChange?.(!!confirmation); return () => onDecisionChange?.(false) }, [confirmation, onDecisionChange])
  const titleInput = useRef<HTMLInputElement>(null)
  const saveButton = useRef<HTMLButtonElement>(null)
  const matches = task ? [] : duplicateTasks(tasks, title)
  function save(input: TaskInput, createAnyway = false) {
    const result = saveTaskDraft(task, input, service, onSave, createAnyway)
    if ('confirmation' in result) { setConfirmation({ input, matches: result.matches }); setMessage(''); return }
    if (result.ok) onClose()
    else { setConfirmation(null); setMessage(result.message) }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = taskDraftInput(draft)
    save(input)
  }
  return <form className="task-editor" onSubmit={submit} noValidate onKeyDown={(event) => {
    if (event.key === 'Escape' && confirmation && (event.target as HTMLElement).tagName !== 'SELECT') {
      event.preventDefault(); event.stopPropagation(); setConfirmation(null); requestAnimationFrame(() => saveButton.current?.focus())
    }
  }} aria-label={task ? 'Edit task' : 'New task'}>
    <h2>{task ? 'Edit task' : 'New task'}</h2>
    {focused && !scheduleOnly && !confirmation && <nav className="bubble-subviews" aria-label="Task editor views">
      <button type="button" aria-pressed={view === 'details'} onClick={() => setView('details')}>Details</button>
      <button type="button" aria-pressed={view === 'content'} onClick={() => setView('content')}>Content</button>
      <button type="button" aria-pressed={view === 'schedule'} onClick={() => setView('schedule')}>Schedule</button></nav>}
    {(!focused || !confirmation) && <fieldset disabled={disabled || !!confirmation}>
      <legend>Task details</legend>
      {!scheduleOnly && (!focused || view === 'details') && <>
      <label>Title<input ref={titleInput} required value={title} onChange={(event) => update({ title: event.target.value })} /></label>
      {matches.length > 0 && <p className="task-duplicate-hint" role="status">
        {matches.length === 1 ? `Same title exists · ${duplicateContext(matches, today)}` : duplicateContext(matches, today)}
      </p>}
      {(categories.length > 0 || categoryId) && <label>Category (optional)
        <select value={categoryId} onChange={(event) => update({ categoryId: event.target.value })}>
          <option value="">No category</option>
          {categoryId && !categories.some((category) => category.id === categoryId) && <option value={categoryId}>Unavailable category</option>}
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>}
      </>}
      {!scheduleOnly && (!focused || view === 'content') && <label>Content (optional)<textarea rows={focused ? 2 : 4} value={content} onChange={(event) => update({ content: event.target.value })} /></label>}
      {(!focused || scheduleOnly || view === 'schedule') && <><label>Schedule<select value={kind} onChange={(event) => update({ kind: event.target.value as TaskSchedule['kind'] })}>
        <option value="unscheduled">Unscheduled</option><option value="date">Specific date</option><option value="dateRange">Date range</option>
      </select></label>
      {kind === 'date' && <>
        <label>Date<input type="date" required value={date} onChange={(event) => update({ date: event.target.value })} /></label>
        <div className="task-range">
          <label>Start time (optional)<input type="time" value={startTime} onChange={(event) => update({ startTime: event.target.value })} /></label>
          <label>End time (optional)<input type="time" value={endTime} onChange={(event) => update({ endTime: event.target.value })} /></label>
        </div><p>Use both times or neither. Time windows stay within one day.</p>
      </>}
      {kind === 'dateRange' && <div className="task-range">
        <label>Start date<input type="date" required value={startDate} onChange={(event) => update({ startDate: event.target.value })} /></label>
        <label>End date<input type="date" required value={endDate} onChange={(event) => update({ endDate: event.target.value })} /></label>
      </div>}</>}
      <button ref={saveButton} type="submit">{scheduleOnly ? 'Save schedule' : 'Save task'}</button>
    </fieldset>}
    {confirmation && <section aria-label="Duplicate task confirmation">
      <p>Same title exists</p><p>{duplicateContext(confirmation.matches, today)}</p><p>Create it anyway?</p>
      <div className="task-actions">
        <button autoFocus type="button" onClick={() => { setConfirmation(null); requestAnimationFrame(() => saveButton.current?.focus()) }}>Back</button>
        <button type="button" disabled={disabled} onClick={() => save(confirmation.input, true)}>Create Anyway</button>
      </div>
    </section>}
    <button type="button" onClick={onClose}>Cancel</button><p role="status">{message}</p>
  </form>
}

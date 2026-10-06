import { describe, expect, it } from 'vitest'
import { editorConflict, openTaskEditor } from './toolPresentation'
import { taskDraftInput } from '../features/tasks/taskFormDraft'
import type { Task } from '../domain/task'

const task: Task = { id: 'one', title: 'Read', content: null, categoryId: null, status: 'open',
  schedule: { kind: 'date', date: '2026-10-06', timeRange: { start: '09:00', end: '10:00' } },
  createdAt: 0, completedAt: null, droppedAt: null }
describe('tool drafts', () => {
  it('gives each explicit editor opening fresh local confirmation identity without altering retained fields', () => {
    const first = openTaskEditor(null)
    first.draft.title = 'Unsaved work'
    const retained = { ...first, draft: { ...first.draft, content: 'Notes' } }
    expect(retained.instance).toBe(first.instance)
    const next = openTaskEditor(null)
    expect(next.instance).not.toBe(first.instance)
    expect(next.draft.title).toBe('')
    expect(retained.draft).toMatchObject({ title: 'Unsaved work', content: 'Notes' })
  })
  it('keeps form values independent from current Task edits and reports disappearance', () => {
    const editor = openTaskEditor(task)
    editor.draft.title = 'Unsaved title'
    expect(taskDraftInput(editor.draft)).toMatchObject({ title: 'Unsaved title', schedule: task.schedule })
    expect(editorConflict(editor, [{ ...task, title: 'Changed elsewhere' }])).toBeNull()
    expect(editorConflict(editor, [])).toContain('draft is kept')
    expect(editor.draft.title).toBe('Unsaved title')
    expect(editorConflict(openTaskEditor(null), [])).toBeNull()
  })
})

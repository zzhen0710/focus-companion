import { describe, expect, it } from 'vitest'
import { normalizeTaskInput, setTaskCompleted } from './task'
import type { Task, TaskInput } from './task'

const input: TaskInput = { title: '  Read  ', content: 'first\nsecond', categoryId: null, schedule: { kind: 'unscheduled' } }
describe('task facts', () => {
  it('normalizes title and blank content while retaining plain-text line breaks', () => {
    expect(normalizeTaskInput(input)).toEqual({ ...input, title: 'Read' })
    expect(normalizeTaskInput({ ...input, content: ' \n ' })?.content).toBeNull()
    expect(normalizeTaskInput({ ...input, title: '  ' })).toBeNull()
    expect(normalizeTaskInput({ ...input, categoryId: '' })).toBeNull()
  })
  it('captures completion once, preserves identity, and clears completion only on reopen', () => {
    const task: Task = { ...input, id: 'task', createdAt: 1000, completed: false, completedAt: null }
    const completed = setTaskCompleted(task, true, 2000)
    expect(completed).toMatchObject({ id: 'task', createdAt: 1000, completed: true, completedAt: 2000 })
    expect(setTaskCompleted(completed, true, 3000)).toBe(completed)
    expect(setTaskCompleted(completed, false, 4000)).toMatchObject({ completed: false, completedAt: null })
    expect(task.completed).toBe(false)
  })
})

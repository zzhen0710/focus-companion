import { describe, expect, it } from 'vitest'
import { normalizeTaskInput, transitionTask } from './task'
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
    const task: Task = { ...input, id: 'task', createdAt: 1000, status: 'open', completedAt: null, droppedAt: null }
    const completed = transitionTask(task, 'complete', 2000)
    if (typeof completed === 'string') throw new Error(completed)
    expect(completed).toMatchObject({ id: 'task', createdAt: 1000, status: 'completed', completedAt: 2000 })
    expect(transitionTask(completed, 'complete', 3000)).toBe(completed)
    expect(transitionTask(completed, 'reopen', 4000)).toMatchObject({ status: 'open', completedAt: null })
    expect(task.status).toBe('open')
  })
})

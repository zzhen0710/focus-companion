import { describe, expect, it } from 'vitest'
import { groupHistory, historyEntries } from './history'
import { createDefaultData } from '../storage/storage'
import type { TaskEvent } from './taskEvent'
describe('immutable chronological History projection', () => {
  it('orders deterministically, groups by local occurrence date and derives review counts', () => {
    const data = createDefaultData(), time = new Date(2026, 9, 6, 12).getTime()
    const event: TaskEvent = { id: 'b', taskId: 'deleted', categoryId: null, reviewId: 'review', occurredAt: time,
      type: 'taskCompleted', taskSnapshot: { title: 'Historical title', schedule: { kind: 'unscheduled' } } }
    data.taskEvents = [event, { ...event, id: 'a', reviewId: null, occurredAt: time - 86400000 }]
    data.sessions = [{ id: 'focus', taskId: 'deleted', categoryId: null, startedAt: time - 60000, endedAt: time,
      outcome: 'interrupted', durationSeconds: 18, plannedDurationSeconds: 25, taskTitleSnapshot: 'Start title' }]
    data.reviews = [{ id: 'review', taskIds: ['deleted'], localDate: '2026-10-06', startedAt: time - 1, completedAt: time }]
    const before = JSON.stringify(data)
    const entries = historyEntries(data)
    expect(entries.map((entry) => entry.kind)).toEqual(['focus', 'review', 'task', 'task'])
    expect(groupHistory(entries).map((group) => group.date)).toEqual(['2026-10-06', '2026-10-05'])
    expect(entries[1]).toMatchObject({ summary: { reviewed: 1, completed: 1, moved: 0, dropped: 0 } })
    expect(JSON.stringify(data)).toBe(before)
    expect(entries[2]).toMatchObject({ record: { taskSnapshot: { title: 'Historical title' } } })
  })
  it('keeps unknown legacy snapshots unknown and supports both Focus outcomes', () => {
    const data = createDefaultData()
    data.sessions = ['completed', 'interrupted'].map((outcome, index) => ({ id: String(index), taskId: 'gone', categoryId: null,
      startedAt: 0, endedAt: 2000 + index, durationSeconds: 1, plannedDurationSeconds: 2,
      outcome: outcome as 'completed' | 'interrupted', taskTitleSnapshot: null }))
    expect(historyEntries(data).map((entry) => entry.kind === 'focus' && entry.record.taskTitleSnapshot)).toEqual([null, null])
  })
})

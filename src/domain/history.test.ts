import { describe, expect, it } from 'vitest'
import { filterHistory, groupHistory, historyEntries } from './history'
import { localCalendarContext } from './calendarWindows'
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

describe('read-only History date filters', () => {
  it('preserves All time, chronology and details while selecting the approved periods', () => {
    const data = createDefaultData(), now = new Date(2026, 9, 6, 12).getTime()
    const ended = [new Date(2026, 8, 29, 12).getTime(), new Date(2026, 8, 30, 12).getTime(),
      new Date(2026, 9, 5, 12).getTime(), new Date(2026, 9, 6, 0).getTime(), now + 1]
    data.sessions = ended.map((endedAt, index) => ({ id: String(index), taskId: null, categoryId: null, startedAt: endedAt,
      endedAt, durationSeconds: 0, plannedDurationSeconds: 0, outcome: 'completed', taskTitleSnapshot: null }))
    const groups = groupHistory(historyEntries(data)), context = localCalendarContext(now), before = structuredClone(groups)
    expect(filterHistory(groups, 'all', context)).toEqual(groups)
    const ids = (period: 'today' | 'week' | 'last7days') => filterHistory(groups, period, context).flatMap((group) => group.entries.map((entry) => entry.id))
    expect(ids('today')).toEqual(['3'])
    expect(ids('week')).toEqual(['3', '2'])
    expect(ids('last7days')).toEqual(['3', '2', '1'])
    const empty = localCalendarContext(new Date(2026, 10, 1, 12).getTime())
    expect(filterHistory(groups, 'today', empty)).toEqual([])
    expect(groups).toEqual(before)
    expect(filterHistory(groups, 'today', context)[0].entries[0]).toBe(groups[0].entries[1])
  })
})

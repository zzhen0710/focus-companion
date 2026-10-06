import { describe, expect, it } from 'vitest'
import { focusSummary, queryInsights, recentFocusTrend, reviewSummaryForWindow, taskFocusSummaries, taskSummary } from './insights'
import { localCalendarContext, resolveCalendarWindow } from './calendarWindows'
import type { FocusSession } from './focusSession'
import type { Task } from './task'
import type { TaskEvent } from './taskEvent'
import { createDefaultData } from '../storage/storage'

const time = (day: number, hour = 12) => new Date(2026, 9, day, hour).getTime()
const context = localCalendarContext(time(6)), window = resolveCalendarWindow('today', context)
function session(id: string, values: Partial<FocusSession> = {}): FocusSession {
  return { id, taskId: null, categoryId: null, startedAt: time(6, 10), endedAt: time(6, 11),
    durationSeconds: 1500, plannedDurationSeconds: 1500, outcome: 'completed', taskTitleSnapshot: null, ...values }
}
function task(id: string, values: Partial<Task> = {}): Task {
  return { id, title: id, content: null, categoryId: null, status: 'open', schedule: { kind: 'unscheduled' },
    createdAt: time(1), completedAt: null, droppedAt: null, ...values }
}
function event(id: string, type: TaskEvent['type'], values: Partial<TaskEvent> = {}): TaskEvent {
  const common = { id, taskId: 'same-task', categoryId: null, occurredAt: time(6, 11), reviewId: null,
    taskSnapshot: { title: 'Task', schedule: { kind: 'unscheduled' as const } } }
  const base: TaskEvent = type === 'taskReopened' ? { ...common, type, previousStatus: 'completed' }
    : type === 'taskRescheduled' ? { ...common, type, previousSchedule: { kind: 'date', date: '2026-10-05', timeRange: null } }
    : { ...common, type }
  return { ...base, ...values } as TaskEvent
}

describe('Focus facts', () => {
  it('has null ratios and averages when empty', () => {
    expect(focusSummary([], window, context)).toEqual({ focusedSeconds: 0, completedCount: 0, interruptedCount: 0,
      sessionCount: 0, completionRate: null, averageSeconds: null })
  })
  it('counts completed-only actual time without using timestamps or planned time', () => {
    const records = [session('a', { durationSeconds: 60 }), session('b', { durationSeconds: 120 })]
    expect(focusSummary(records, window, context)).toEqual({ focusedSeconds: 180, completedCount: 2, interruptedCount: 0,
      sessionCount: 2, completionRate: 1, averageSeconds: 90 })
  })
  it('counts interrupted-only actual time', () => {
    expect(focusSummary([session('a', { outcome: 'interrupted', durationSeconds: 17 })], window, context))
      .toMatchObject({ focusedSeconds: 17, completedCount: 0, interruptedCount: 1, completionRate: 0, averageSeconds: 17 })
  })
  it('counts mixed outcomes and retains a valid zero-duration completed record', () => {
    expect(focusSummary([session('a', { durationSeconds: 0 }), session('b', { outcome: 'interrupted', durationSeconds: 11 })], window, context))
      .toEqual({ focusedSeconds: 11, completedCount: 1, interruptedCount: 1, sessionCount: 2, completionRate: 0.5, averageSeconds: 5.5 })
  })
  it.each(['completed', 'interrupted'] as const)('attributes cross-midnight %s entirely by endedAt', (outcome) => {
    const record = session('overnight', { startedAt: time(5, 23), endedAt: time(6, 0), durationSeconds: 900, outcome })
    expect(focusSummary([record], window, context).focusedSeconds).toBe(900)
    const yesterday = localCalendarContext(time(5, 23))
    expect(focusSummary([record], resolveCalendarWindow('today', yesterday), yesterday).sessionCount).toBe(0)
  })
  it('excludes earlier, future and unsaved Timer time', () => {
    const data = createDefaultData()
    data.timer = { status: 'paused', mode: 'focus', id: 'live', taskId: null, categoryId: null, taskTitleSnapshot: null,
      startedAt: time(6, 10), accumulatedMs: 900000, durationMs: 1500000 }
    data.sessions = [session('yesterday', { endedAt: time(5) }), session('future', { endedAt: context.now + 1 })]
    expect(queryInsights(data, 'today', context).focus.sessionCount).toBe(0)
  })
})

describe('Task current state and historical operations', () => {
  it('uses the exact Review overdue rules, separate from windowed operations', () => {
    const tasks = [task('past', { schedule: { kind: 'date', date: '2026-10-05', timeRange: null } }),
      task('range', { schedule: { kind: 'dateRange', startDate: '2026-10-01', endDate: '2026-10-05' } }),
      task('today', { schedule: { kind: 'date', date: '2026-10-06', timeRange: { start: '01:00', end: '02:00' } } }),
      task('overlap', { schedule: { kind: 'dateRange', startDate: '2026-10-01', endDate: '2026-10-06' } }),
      task('unscheduled'), task('future', { schedule: { kind: 'date', date: '2026-10-07', timeRange: null } }),
      task('closed', { status: 'completed', schedule: { kind: 'date', date: '2026-10-05', timeRange: null } }),
      task('dropped', { status: 'dropped', schedule: { kind: 'date', date: '2026-10-05', timeRange: null } })]
    expect(taskSummary(tasks, [], window, context)).toEqual({ now: { openCount: 6, overdueCount: 2 },
      activity: { completions: 0, drops: 0, reschedules: 0 } })
  })
  it('counts operations, including repeat completion after Reopen, without rewriting facts', () => {
    const events = [event('first', 'taskCompleted'), event('reopen', 'taskReopened'), event('second', 'taskCompleted'),
      event('drop', 'taskDropped'), event('move', 'taskRescheduled'), event('old', 'taskCompleted', { occurredAt: time(5) }),
      event('future', 'taskCompleted', { occurredAt: context.now + 1 })]
    expect(taskSummary([task('same-task')], events, window, context)).toEqual({ now: { openCount: 1, overdueCount: 0 },
      activity: { completions: 2, drops: 1, reschedules: 1 } })
    // A current terminal timestamp cannot manufacture an event missing from older versions.
    expect(taskSummary([task('legacy', { status: 'completed', completedAt: time(6) })], [], window, context).activity.completions).toBe(0)
  })
})

describe('Review factual subsets', () => {
  it('counts records by completion time and actions by their own time, including active Review actions', () => {
    const reviews = [{ id: 'finished', localDate: '2026-10-05', startedAt: time(5), completedAt: time(6, 1), taskIds: ['a', 'b', 'skipped'] },
      { id: 'old', localDate: '2026-10-05', startedAt: time(5), completedAt: time(5, 23), taskIds: ['c'] }]
    const events = [event('prior-action', 'taskCompleted', { reviewId: 'finished', occurredAt: time(5, 23) }),
      event('today-action', 'taskRescheduled', { reviewId: 'finished', occurredAt: time(6, 0) }),
      event('active-action', 'taskDropped', { reviewId: 'active' }),
      event('active-complete', 'taskCompleted', { reviewId: 'active' }), event('outside', 'taskCompleted')]
    expect(reviewSummaryForWindow(reviews, events, window, context)).toEqual({ completedCount: 1,
      actions: { completions: 1, drops: 1, reschedules: 1 } })
    expect(taskSummary([], events, window, context).activity.completions).toBe(2)
  })
  it('does not fabricate counts from cohorts or Review start dates', () => {
    expect(reviewSummaryForWindow([{ id: 'future', localDate: '2026-10-06', startedAt: time(6),
      completedAt: time(7), taskIds: ['a', 'b'] }], [], window, context)).toEqual({ completedCount: 0,
      actions: { completions: 0, drops: 0, reschedules: 0 } })
  })
})

describe('seven-day Focus trend', () => {
  it('fills exactly seven ascending dates, mixes outcomes, and matches the same window total', () => {
    const sessions = [session('old', { endedAt: new Date(2026, 8, 29, 12).getTime(), startedAt: new Date(2026, 8, 29, 11).getTime() }),
      session('day-one', { endedAt: new Date(2026, 8, 30, 12).getTime(), startedAt: new Date(2026, 8, 30, 11).getTime(), durationSeconds: 5 }),
      session('a', { durationSeconds: 20 }), session('b', { durationSeconds: 10, outcome: 'interrupted' }),
      session('future', { endedAt: context.now + 1 })]
    const trend = recentFocusTrend(sessions, context)
    expect(trend.map((point) => point.date)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'])
    expect(trend[1]).toEqual({ date: '2026-10-01', focusedSeconds: 0, completedCount: 0, interruptedCount: 0 })
    expect(trend[6]).toEqual({ date: '2026-10-06', focusedSeconds: 30, completedCount: 1, interruptedCount: 1 })
    expect(trend.reduce((sum, point) => sum + point.focusedSeconds, 0))
      .toBe(focusSummary(sessions, resolveCalendarWindow('last7days', context), context).focusedSeconds)
  })
})

describe('Task identity and captured Focus titles', () => {
  it('groups IDs, uses the latest non-null capture, and never needs the current Task', () => {
    const records = [session('old-name', { taskId: 'deleted', taskTitleSnapshot: 'Old name', durationSeconds: 60, startedAt: time(6, 8) }),
      session('new-name', { taskId: 'deleted', taskTitleSnapshot: 'New name', durationSeconds: 10, outcome: 'interrupted', startedAt: time(6, 9) }),
      session('newer-unknown', { taskId: 'deleted', durationSeconds: 0 }),
      session('same-title-other-id', { taskId: 'other', taskTitleSnapshot: 'New name', durationSeconds: 20 }),
      session('unknown', { taskId: 'legacy', durationSeconds: 3 }), session('unbound', { durationSeconds: 2 }),
      session('outside', { taskId: 'deleted', taskTitleSnapshot: 'Outside window', endedAt: time(5), startedAt: time(5) })]
    const results = taskFocusSummaries(records, window, context)
    expect(results.map((group) => [group.taskId, group.title])).toEqual([
      ['deleted', 'New name'], ['other', 'New name'], ['legacy', 'Unknown historical task'], [null, 'No task']])
    expect(results[0]).toMatchObject({ focusedSeconds: 70, sessionCount: 3, completedCount: 2, interruptedCount: 1 })
    const data = createDefaultData()
    data.sessions = records; data.tasks = [task('deleted', { title: 'Current correction' })]
    expect(queryInsights(data, 'today', context).taskFocus).toEqual(results)
    data.tasks = []
    expect(queryInsights(data, 'today', context).taskFocus).toEqual(results)
  })
  it('orders duration ties by identity and title-capture ties by session ID, regardless of input order', () => {
    const records = [session('z', { taskId: 'b', taskTitleSnapshot: 'Z', durationSeconds: 1 }),
      session('a', { taskId: 'b', taskTitleSnapshot: 'A', durationSeconds: 1 }),
      session('c', { taskId: 'a', durationSeconds: 2 }), session('d', { durationSeconds: 2 })]
    const result = taskFocusSummaries(records, window, context)
    expect(result.map((group) => group.taskId)).toEqual(['a', 'b', null])
    expect(result[1].title).toBe('A')
    expect(taskFocusSummaries([...records].reverse(), window, context)).toEqual(result)
  })
  it('does not mutate source collections or records', () => {
    const data = createDefaultData()
    data.sessions = [session('one')]; data.tasks = [task('task')]; data.taskEvents = [event('event', 'taskCompleted')]
    const before = structuredClone(data)
    Object.freeze(data.sessions); Object.freeze(data.tasks); Object.freeze(data.taskEvents); Object.freeze(data.reviews)
    queryInsights(data, 'today', context); queryInsights(data, 'week', context); queryInsights(data, 'last7days', context)
    expect(data).toEqual(before)
  })
})

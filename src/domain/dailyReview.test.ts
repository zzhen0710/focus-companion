import { describe, expect, it, vi } from 'vitest'
import { isReviewEligible } from './dailyReview'
import { localCalendarDate } from './taskSchedule'
import type { TaskSchedule } from './taskSchedule'
import type { Task } from './task'
const task: Task = { id: 'task', title: 'Read', content: null, categoryId: null, status: 'open', createdAt: 0,
  completedAt: null, droppedAt: null, schedule: { kind: 'unscheduled' } }
describe('local review eligibility', () => {
  it.each([
    [{ kind: 'date', date: '2026-10-05', timeRange: null }, true],
    [{ kind: 'date', date: '2026-10-06', timeRange: { start: '01:00', end: '02:00' } }, false],
    [{ kind: 'date', date: '2026-10-07', timeRange: null }, false],
    [{ kind: 'dateRange', startDate: '2026-09-01', endDate: '2026-10-05' }, true],
    [{ kind: 'dateRange', startDate: '2026-09-01', endDate: '2026-10-06' }, false],
    [{ kind: 'unscheduled' }, false],
  ] as [TaskSchedule, boolean][])('checks %j', (schedule, expected) => {
    expect(isReviewEligible({ ...task, schedule }, '2026-10-06')).toBe(expected)
  })
  it.each(['completed', 'dropped'] as const)('excludes %s tasks', (status) => {
    expect(isReviewEligible({ ...task, status, schedule: { kind: 'date', date: '2026-01-01', timeRange: null } }, '2026-10-06')).toBe(false)
  })
  it.each([['2025-12-31', '2026-01-01'], ['2024-02-29', '2024-03-01'], ['2026-01-01', '2026-10-06']])('crosses %s → %s without fake missed-day reviews', (date, today) => {
    expect(isReviewEligible({ ...task, schedule: { kind: 'date', date, timeRange: null } }, today)).toBe(true)
  })
  it('uses the current local calendar around timezone/DST boundaries', () => {
    try {
      vi.stubEnv('TZ', 'America/New_York')
      const scheduled = { ...task, schedule: { kind: 'date' as const, date: '2026-03-08', timeRange: null } }
      expect(isReviewEligible(scheduled, localCalendarDate(new Date(2026, 2, 8, 23, 59).getTime()))).toBe(false)
      expect(isReviewEligible(scheduled, localCalendarDate(new Date(2026, 2, 9, 0).getTime()))).toBe(true)
    } finally { vi.unstubAllEnvs() }
  })
})

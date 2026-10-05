import { describe, expect, it, vi } from 'vitest'
import { addCalendarDays, isCalendarDate, isTaskSchedule, localCalendarDate, matchesCalendarQuery } from './taskSchedule'
import type { CalendarQuery } from './taskSchedule'

describe('floating task schedules', () => {
  it.each(['2024-02-29', '2000-02-29', '0001-01-01', '2026-12-31'])('accepts calendar date %s', (date) => {
    expect(isCalendarDate(date)).toBe(true)
  })
  it.each(['2026-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '0000-01-01', '2026-1-01', ''])('rejects calendar date %s', (date) => {
    expect(isCalendarDate(date)).toBe(false)
  })
  it('validates all schedule variants without inactive fields', () => {
    for (const schedule of [{ kind: 'unscheduled' }, { kind: 'date', date: '2026-10-06', timeRange: null },
      { kind: 'date', date: '2026-10-06', timeRange: { start: '14:00', end: '16:00' } },
      { kind: 'dateRange', startDate: '2026-10-06', endDate: '2026-10-06' }]) expect(isTaskSchedule(schedule)).toBe(true)
    expect(isTaskSchedule({ kind: 'unscheduled', date: '2026-10-06' })).toBe(false)
    expect(isTaskSchedule({ kind: 'dateRange', startDate: '2026-10-06' })).toBe(false)
    expect(isTaskSchedule({ kind: 'dateRange', startDate: '2026-10-07', endDate: '2026-10-06' })).toBe(false)
  })
  it.each([{ start: '14:00' }, { start: '', end: '16:00' }, { start: '24:00', end: '25:00' },
    { start: '14:60', end: '16:00' }, { start: '14:00', end: '14:00' }, { start: '23:00', end: '01:00' }])('rejects invalid time range %j', (timeRange) => {
    expect(isTaskSchedule({ kind: 'date', date: '2026-10-06', timeRange })).toBe(false)
  })
  it('uses calendar arithmetic through leap days and month/year boundaries', () => {
    expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it.each([
    ['today', '2026-10-05', true], ['today', '2026-10-04', false],
    ['tomorrow', '2026-10-06', true], ['week', '2026-10-11', true], ['week', '2026-10-04', false],
    ['month', '2026-10-31', true], ['later', '2026-11-01', true], ['later', '2026-10-31', false],
  ] as [CalendarQuery, string, boolean][])('matches %s for %s', (query, date, expected) => {
    expect(matchesCalendarQuery({ kind: 'date', date, timeRange: null }, query, '2026-10-05')).toBe(expected)
  })
  it('matches inclusive overlap and Monday-start weeks across years', () => {
    const range = { kind: 'dateRange' as const, startDate: '2026-09-30', endDate: '2026-10-05' }
    expect(matchesCalendarQuery(range, 'today', '2026-10-05')).toBe(true)
    expect(matchesCalendarQuery(range, 'tomorrow', '2026-10-05')).toBe(false)
    expect(matchesCalendarQuery(range, 'month', '2026-10-05')).toBe(true)
    expect(matchesCalendarQuery({ kind: 'date', date: '2025-12-29', timeRange: null }, 'week', '2026-01-04')).toBe(true)
    expect(matchesCalendarQuery({ kind: 'date', date: '2027-01-01', timeRange: null }, 'tomorrow', '2026-12-31')).toBe(true)
    expect(matchesCalendarQuery({ kind: 'unscheduled' }, 'unscheduled', '2026-10-05')).toBe(true)
    expect(matchesCalendarQuery({ kind: 'unscheduled' }, 'today', '2026-10-05')).toBe(false)
  })
  it('derives local today from local components, not UTC parsing', () => {
    const now = new Date(2026, 9, 5, 23, 59).getTime()
    expect(localCalendarDate(now)).toBe('2026-10-05')
    expect(localCalendarDate(new Date(2026, 9, 6, 0, 0).getTime())).toBe('2026-10-06')
    expect(addCalendarDays('2026-03-08', 1)).toBe('2026-03-09')
  })
  it('keeps planned clock values fixed across timezone changes and derives local today across DST', () => {
    const schedule = { kind: 'date' as const, date: '2026-10-06', timeRange: { start: '14:00', end: '16:00' } }
    const before = JSON.stringify(schedule)
    try {
      vi.stubEnv('TZ', 'Asia/Shanghai')
      expect(localCalendarDate(Date.UTC(2026, 9, 6, 0, 30))).toBe('2026-10-06')
      vi.stubEnv('TZ', 'America/New_York')
      expect(localCalendarDate(Date.UTC(2026, 9, 6, 0, 30))).toBe('2026-10-05')
      const start = new Date(2026, 2, 8, 0).getTime()
      const end = new Date(2026, 2, 9, 0).getTime()
      expect(end - start).toBe(23 * 60 * 60 * 1000)
      expect(addCalendarDays(localCalendarDate(start), 1)).toBe(localCalendarDate(end))
      expect(JSON.stringify(schedule)).toBe(before)
    } finally { vi.unstubAllEnvs() }
  })
})

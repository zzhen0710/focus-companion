import { describe, expect, it } from 'vitest'
import { isWithinCalendarWindow, localCalendarContext, resolveCalendarWindow } from './calendarWindows'
import type { CalendarContext, InsightPeriod } from './calendarWindows'

function inZone(now: number, timeZone: string): CalendarContext {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const dateOf = (timestamp: number) => {
    const parts = formatter.formatToParts(timestamp)
    return ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)!.value).join('-')
  }
  return { now, today: dateOf(now), dateOf }
}

describe('explicit local-calendar windows', () => {
  it.each([
    ['today', '2026-10-06', '2026-10-07'],
    ['week', '2026-10-05', '2026-10-12'],
    ['last7days', '2026-09-30', '2026-10-07'],
  ] as [InsightPeriod, string, string][])('resolves %s from the reference calendar', (period, startDate, endDateExclusive) => {
    const context = inZone(Date.UTC(2026, 9, 6, 4), 'Asia/Shanghai')
    expect(resolveCalendarWindow(period, context)).toEqual({ startDate, endDateExclusive })
  })
  it('includes the lower boundary and reference instant, excluding old and future facts', () => {
    const now = Date.UTC(2026, 9, 6, 4)
    const context = inZone(now, 'Asia/Shanghai'), window = resolveCalendarWindow('today', context)
    const start = Date.UTC(2026, 9, 5, 16)
    expect(isWithinCalendarWindow(start, window, context)).toBe(true)
    expect(isWithinCalendarWindow(start - 1, window, context)).toBe(false)
    expect(isWithinCalendarWindow(now, window, context)).toBe(true)
    expect(isWithinCalendarWindow(now + 1, window, context)).toBe(false)
    expect(isWithinCalendarWindow(Date.UTC(2026, 9, 6, 16), window, context)).toBe(false)
  })
  it.each([
    ['2026-01-04', '2025-12-29', '2026-01-05'],
    ['2026-01-05', '2026-01-05', '2026-01-12'],
  ])('starts weeks on Monday around %s', (today, startDate, endDateExclusive) => {
    const context = inZone(Date.parse(`${today}T12:00:00Z`), 'UTC')
    expect(resolveCalendarWindow('week', context)).toEqual({ startDate, endDateExclusive })
  })
  it.each([
    ['2027-01-01', '2026-12-26', '2027-01-02'],
    ['2024-03-01', '2024-02-24', '2024-03-02'],
    ['2024-02-29', '2024-02-23', '2024-03-01'],
  ])('keeps seven dates through month/year/leap boundaries at %s', (today, startDate, endDateExclusive) => {
    expect(resolveCalendarWindow('last7days', inZone(Date.parse(`${today}T12:00:00Z`), 'UTC')))
      .toEqual({ startDate, endDateExclusive })
  })
  it.each([
    ['2026-03-08T05:00:00Z', '2026-03-09T04:00:00Z', 23, '2026-03-08'],
    ['2026-11-01T04:00:00Z', '2026-11-02T05:00:00Z', 25, '2026-11-01'],
  ])('covers the entire %s local day without fixed-hour arithmetic', (startText, endText, hours, date) => {
    const start = Date.parse(startText), end = Date.parse(endText)
    expect(end - start).toBe(Number(hours) * 3600000)
    const context = inZone(end - 1, 'America/New_York'), window = resolveCalendarWindow('today', context)
    expect(window.startDate).toBe(date)
    expect(isWithinCalendarWindow(start, window, context)).toBe(true)
    expect(isWithinCalendarWindow(end - 1, window, context)).toBe(true)
    expect(isWithinCalendarWindow(start - 1, window, context)).toBe(false)
    expect(resolveCalendarWindow('last7days', context).startDate).toBe(date === '2026-03-08' ? '2026-03-02' : '2026-10-26')
  })
  it('uses the supplied zone and time rather than a hidden clock', () => {
    const now = Date.UTC(2026, 9, 6, 0, 30)
    expect(resolveCalendarWindow('today', inZone(now, 'Asia/Shanghai')).startDate).toBe('2026-10-06')
    expect(resolveCalendarWindow('today', inZone(now, 'America/New_York')).startDate).toBe('2026-10-05')
    const local = localCalendarContext(new Date(2024, 1, 29, 12).getTime())
    expect(local.today).toBe('2024-02-29')
    expect(local.now).toBe(new Date(2024, 1, 29, 12).getTime())
  })
})

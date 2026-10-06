import { addCalendarDays, localCalendarDate } from './taskSchedule'

export type InsightPeriod = 'today' | 'week' | 'last7days'
export type HistoryPeriod = 'all' | InsightPeriod
export interface CalendarContext {
  now: number
  today: string
  dateOf(timestamp: number): string
}
export interface CalendarWindow { startDate: string; endDateExclusive: string }

/** Capture the caller's reference time; calendar dates use the current local zone. */
export function localCalendarContext(now: number): CalendarContext {
  return { now, today: localCalendarDate(now), dateOf: localCalendarDate }
}

export function resolveCalendarWindow(period: InsightPeriod, context: CalendarContext): CalendarWindow {
  let startDate = context.today
  if (period === 'last7days') startDate = addCalendarDays(context.today, -6)
  if (period === 'week') {
    // UTC is only a workspace for the weekday of these floating date components.
    const weekday = new Date(`${context.today}T00:00:00Z`).getUTCDay()
    startDate = addCalendarDays(context.today, -((weekday + 6) % 7))
  }
  return { startDate, endDateExclusive: period === 'week'
    ? addCalendarDays(startDate, 7) : addCalendarDays(context.today, 1) }
}

export function isWithinCalendarWindow(timestamp: number, window: CalendarWindow, context: CalendarContext): boolean {
  if (timestamp > context.now) return false
  const date = context.dateOf(timestamp)
  return date >= window.startDate && date < window.endDateExclusive
}

export type TaskSchedule =
  | { kind: 'unscheduled' }
  | { kind: 'date'; date: string; timeRange: null | { start: string; end: string } }
  | { kind: 'dateRange'; startDate: string; endDate: string }

export type CalendarQuery = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'later' | 'unscheduled'

function calendarDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function formatDate(date: Date): string {
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function isCalendarDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    value.slice(0, 4) !== '0000' && formatDate(calendarDate(value)) === value
}

export function localCalendarDate(now: number): string {
  const date = new Date(now)
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** UTC is only an arithmetic workspace for calendar components, never a task instant. */
export function addCalendarDays(date: string, days: number): string {
  if (!isCalendarDate(date)) throw new Error('Invalid calendar date')
  const result = calendarDate(date)
  result.setUTCDate(result.getUTCDate() + days)
  return formatDate(result)
}

function hasKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => key in value)
}

export function isTaskSchedule(value: unknown): value is TaskSchedule {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const schedule = value as Record<string, unknown>
  if (schedule.kind === 'unscheduled') return hasKeys(schedule, ['kind'])
  if (schedule.kind === 'dateRange') return hasKeys(schedule, ['kind', 'startDate', 'endDate']) &&
    isCalendarDate(schedule.startDate) && isCalendarDate(schedule.endDate) && schedule.startDate <= schedule.endDate
  if (schedule.kind !== 'date' || !hasKeys(schedule, ['kind', 'date', 'timeRange']) || !isCalendarDate(schedule.date)) return false
  if (schedule.timeRange === null) return true
  if (!schedule.timeRange || typeof schedule.timeRange !== 'object' || Array.isArray(schedule.timeRange)) return false
  const range = schedule.timeRange as Record<string, unknown>
  const time = (v: unknown): v is string => typeof v === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v)
  return hasKeys(range, ['start', 'end']) && time(range.start) && time(range.end) && range.start < range.end
}

export function matchesCalendarQuery(schedule: TaskSchedule, query: CalendarQuery, today: string): boolean {
  if (!isCalendarDate(today)) throw new Error('Invalid calendar context')
  if (query === 'all') return true
  if (query === 'unscheduled') return schedule.kind === 'unscheduled'
  if (schedule.kind === 'unscheduled') return false
  const start = schedule.kind === 'date' ? schedule.date : schedule.startDate
  const end = schedule.kind === 'date' ? schedule.date : schedule.endDate
  const day = calendarDate(today)
  const monthStart = `${today.slice(0, 7)}-01`
  const nextMonth = calendarDate(monthStart)
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
  nextMonth.setUTCDate(0)
  const monthEnd = formatDate(nextMonth)
  if (query === 'later') return start > monthEnd
  let from = today
  let to = today
  if (query === 'tomorrow') from = to = addCalendarDays(today, 1)
  if (query === 'week') {
    from = addCalendarDays(today, -((day.getUTCDay() + 6) % 7))
    to = addCalendarDays(from, 6)
  }
  if (query === 'month') { from = monthStart; to = monthEnd }
  return start <= to && end >= from
}

export function scheduleLabel(schedule: TaskSchedule): string {
  if (schedule.kind === 'unscheduled') return 'Unscheduled'
  if (schedule.kind === 'dateRange') return `${schedule.startDate} – ${schedule.endDate}`
  return schedule.date + (schedule.timeRange ? ` · ${schedule.timeRange.start}–${schedule.timeRange.end}` : '')
}

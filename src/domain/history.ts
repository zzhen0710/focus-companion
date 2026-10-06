import type { FocusSession } from './focusSession'
import type { TaskEvent } from './taskEvent'
import type { ReviewRecord } from './dailyReview'
import { reviewSummary } from './dailyReview'
import { localCalendarDate } from './taskSchedule'
import { isWithinCalendarWindow, resolveCalendarWindow } from './calendarWindows'
import type { CalendarContext, HistoryPeriod } from './calendarWindows'

export type HistoryEntry =
  | { kind: 'focus'; id: string; occurredAt: number; record: FocusSession }
  | { kind: 'task'; id: string; occurredAt: number; record: TaskEvent }
  | { kind: 'review'; id: string; occurredAt: number; record: ReviewRecord; summary: ReturnType<typeof reviewSummary> }
export function historyEntries(data: { sessions: FocusSession[]; taskEvents: TaskEvent[]; reviews: ReviewRecord[] }): HistoryEntry[] {
  const entries: HistoryEntry[] = [
    ...data.sessions.map((record) => ({ kind: 'focus' as const, id: record.id, occurredAt: record.endedAt, record })),
    ...data.taskEvents.map((record) => ({ kind: 'task' as const, id: record.id, occurredAt: record.occurredAt, record })),
    ...data.reviews.map((record) => ({ kind: 'review' as const, id: record.id, occurredAt: record.completedAt, record,
      summary: reviewSummary(data.taskEvents, record.id) })),
  ]
  return entries.sort((a, b) => b.occurredAt - a.occurredAt ||
    (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}
export function groupHistory(entries: HistoryEntry[]) {
  const groups = new Map<string, HistoryEntry[]>()
  for (const entry of entries) {
    const date = localCalendarDate(entry.occurredAt)
    groups.set(date, [...groups.get(date) ?? [], entry])
  }
  return [...groups].map(([date, entries]) => ({ date, entries }))
}

/** Filter facts before regrouping, so a changed local zone also refreshes dates. */
export function filterHistory(groups: ReturnType<typeof groupHistory>, period: HistoryPeriod, context: CalendarContext) {
  const entries = groups.flatMap((group) => group.entries)
  const window = period === 'all' ? null : resolveCalendarWindow(period, context)
  const filtered = window ? entries.filter((entry) => isWithinCalendarWindow(entry.occurredAt, window, context)) : entries
  const dates = new Map<string, HistoryEntry[]>()
  for (const entry of filtered) {
    const date = context.dateOf(entry.occurredAt)
    const group = dates.get(date)
    if (group) group.push(entry)
    else dates.set(date, [entry])
  }
  return [...dates].map(([date, entries]) => ({ date, entries }))
}

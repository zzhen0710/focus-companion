import type { FocusSession } from './focusSession'
import type { Task } from './task'
import type { TaskEvent } from './taskEvent'
import type { ReviewRecord } from './dailyReview'
import { isReviewEligible } from './dailyReview'
import { addCalendarDays } from './taskSchedule'
import { isWithinCalendarWindow, resolveCalendarWindow } from './calendarWindows'
import type { CalendarContext, CalendarWindow, InsightPeriod } from './calendarWindows'

export interface InsightFacts {
  readonly sessions: readonly FocusSession[]
  readonly tasks: readonly Task[]
  readonly taskEvents: readonly TaskEvent[]
  readonly reviews: readonly ReviewRecord[]
}
export interface FocusSummary {
  focusedSeconds: number
  completedCount: number
  interruptedCount: number
  sessionCount: number
  completionRate: number | null
  averageSeconds: number | null
}
export interface DailyFocusPoint {
  date: string
  focusedSeconds: number
  completedCount: number
  interruptedCount: number
}
export interface TaskFocusSummary {
  taskId: string | null
  title: string
  focusedSeconds: number
  sessionCount: number
  completedCount: number
  interruptedCount: number
}

function summarizeFocus(sessions: readonly FocusSession[]): FocusSummary {
  const focusedSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0)
  const completedCount = sessions.filter((session) => session.outcome === 'completed').length
  const interruptedCount = sessions.filter((session) => session.outcome === 'interrupted').length
  const sessionCount = completedCount + interruptedCount
  return { focusedSeconds, completedCount, interruptedCount, sessionCount,
    completionRate: sessionCount ? completedCount / sessionCount : null,
    averageSeconds: sessionCount ? focusedSeconds / sessionCount : null }
}

export function focusSummary(sessions: readonly FocusSession[], window: CalendarWindow, context: CalendarContext): FocusSummary {
  return summarizeFocus(sessions.filter((session) => isWithinCalendarWindow(session.endedAt, window, context)))
}

function operationCounts(events: readonly TaskEvent[]) {
  return { completions: events.filter((event) => event.type === 'taskCompleted').length,
    drops: events.filter((event) => event.type === 'taskDropped').length,
    reschedules: events.filter((event) => event.type === 'taskRescheduled').length }
}

export function taskSummary(tasks: readonly Task[], events: readonly TaskEvent[], window: CalendarWindow, context: CalendarContext) {
  return { now: { openCount: tasks.filter((task) => task.status === 'open').length,
    overdueCount: tasks.filter((task) => isReviewEligible(task, context.today)).length },
  activity: operationCounts(events.filter((event) => isWithinCalendarWindow(event.occurredAt, window, context))) }
}

export function reviewSummaryForWindow(reviews: readonly ReviewRecord[], events: readonly TaskEvent[], window: CalendarWindow, context: CalendarContext) {
  return { completedCount: reviews.filter((review) => isWithinCalendarWindow(review.completedAt, window, context)).length,
    actions: operationCounts(events.filter((event) => event.reviewId !== null &&
      isWithinCalendarWindow(event.occurredAt, window, context))) }
}

export function recentFocusTrend(sessions: readonly FocusSession[], context: CalendarContext): DailyFocusPoint[] {
  const window = resolveCalendarWindow('last7days', context)
  const points: DailyFocusPoint[] = Array.from({ length: 7 }, (_, index) => ({
    date: addCalendarDays(window.startDate, index), focusedSeconds: 0, completedCount: 0, interruptedCount: 0,
  }))
  const byDate = new Map(points.map((point) => [point.date, point]))
  for (const session of sessions) {
    if (!isWithinCalendarWindow(session.endedAt, window, context)) continue
    const point = byDate.get(context.dateOf(session.endedAt))!
    point.focusedSeconds += session.durationSeconds
    if (session.outcome === 'completed') point.completedCount++
    else point.interruptedCount++
  }
  return points
}

export function taskFocusSummaries(sessions: readonly FocusSession[], window: CalendarWindow, context: CalendarContext): TaskFocusSummary[] {
  const groups = new Map<string | null, FocusSession[]>()
  for (const session of sessions) {
    if (!isWithinCalendarWindow(session.endedAt, window, context)) continue
    const group = groups.get(session.taskId)
    if (group) group.push(session)
    else groups.set(session.taskId, [session])
  }
  return [...groups].map(([taskId, group]) => {
    // Title was captured at Start. Use the latest capture, with an ID tie-breaker.
    const titled = group.filter((session) => session.taskTitleSnapshot !== null)
      .sort((a, b) => b.startedAt - a.startedAt || compareIdentity(a.id, b.id))
    const { focusedSeconds, sessionCount, completedCount, interruptedCount } = summarizeFocus(group)
    return { taskId, title: taskId === null ? 'No task' : titled[0]?.taskTitleSnapshot ?? 'Unknown historical task',
      focusedSeconds, sessionCount, completedCount, interruptedCount }
  }).sort((a, b) => b.focusedSeconds - a.focusedSeconds || compareIdentity(a.taskId, b.taskId))
}

function compareIdentity(a: string | null, b: string | null): number {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a < b ? -1 : 1
}

export function queryInsights(facts: InsightFacts, period: InsightPeriod, context: CalendarContext) {
  const window = resolveCalendarWindow(period, context)
  return { window, focus: focusSummary(facts.sessions, window, context),
    tasks: taskSummary(facts.tasks, facts.taskEvents, window, context),
    review: reviewSummaryForWindow(facts.reviews, facts.taskEvents, window, context),
    taskFocus: taskFocusSummaries(facts.sessions, window, context),
    trend: recentFocusTrend(facts.sessions, context) }
}
export type InsightsSummary = ReturnType<typeof queryInsights>

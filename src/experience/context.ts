import type { Task } from '../domain/task'
import type { TaskEvent } from '../domain/taskEvent'
import type { FocusSession } from '../domain/focusSession'
import type { ReviewDraft } from '../domain/dailyReview'
import type { Settings } from '../domain/settings'
import type { TimerState } from '../domain/timer'
import type { FocusSummary } from '../domain/insights'
import { elapsedMs, remainingMs } from '../domain/timer'
import { focusSummary } from '../domain/insights'
import { isReviewEligible, reviewQueue } from '../domain/dailyReview'
import { localCalendarContext, resolveCalendarWindow } from '../domain/calendarWindows'

export type Available<T> =
  | { status: 'loading' }
  | { status: 'unavailable'; error: string }
  | { status: 'ready'; value: T; asOf: number }
  | { status: 'stale'; value: T; asOf: number; error: string }

/** Projection inputs only. These records never cross the rendering boundary. */
export interface SavedFacts {
  readonly tasks: readonly Task[]
  readonly sessions: readonly FocusSession[]
  readonly taskEvents: readonly TaskEvent[]
  readonly activeReview: ReviewDraft | null
}
export interface LiveFocus {
  timer: TimerState
  settings: Settings
  pendingCompletion: boolean
  pendingReset: boolean
  error: string | null
}
export interface TaskIdentity { id: string; title: string; status: Task['status'] }
export interface SavedContext {
  localDate: string
  todayFocus: FocusSummary
  lastFocus: { id: string; outcome: FocusSession['outcome']; endedAt: number; historicalTitle: string | null } | null
  lastTaskOutcome: { id: string; taskId: string; type: TaskEvent['type']; occurredAt: number; historicalTitle: string } | null
  overdueCount: number
  review: { id: string | null; remainingCount: number }
}
export interface FocusContext {
  mode: TimerState['mode']
  status: TimerState['status']
  periodId: string | null
  elapsedMs: number
  remainingMs: number
  capturedTarget: { taskId: string | null; categoryId: string | null; historicalTitle: string | null } | null
  currentTarget: Available<TaskIdentity | null>
  pendingCompletion: boolean
  pendingReset: boolean
  error: string | null
}
export interface ExperienceContext {
  now: number
  localDate: string
  dayPhase: 'morning' | 'afternoon' | 'evening' | 'night'
  focus: Available<FocusContext>
  saved: Available<SavedContext>
  selection: { taskId: string | null; currentTask: Available<TaskIdentity | null> }
}

function newest<T extends { id: string }>(records: readonly T[], timestamp: (record: T) => number, now: number): T | undefined {
  return records.filter((record) => timestamp(record) <= now)
    .reduce<T | undefined>((latest, record) => !latest || timestamp(record) > timestamp(latest) ||
      (timestamp(record) === timestamp(latest) && record.id < latest.id) ? record : latest, undefined)
}

export function projectSavedFacts(facts: SavedFacts, now: number): SavedContext {
  const calendar = localCalendarContext(now)
  const focus = newest(facts.sessions, (session) => session.endedAt, now)
  const task = newest(facts.taskEvents, (event) => event.occurredAt, now)
  return {
    localDate: calendar.today,
    todayFocus: focusSummary(facts.sessions, resolveCalendarWindow('today', calendar), calendar),
    lastFocus: focus ? { id: focus.id, outcome: focus.outcome, endedAt: focus.endedAt, historicalTitle: focus.taskTitleSnapshot } : null,
    lastTaskOutcome: task ? { id: task.id, taskId: task.taskId, type: task.type, occurredAt: task.occurredAt,
      historicalTitle: task.taskSnapshot.title } : null,
    overdueCount: facts.tasks.filter((item) => isReviewEligible(item, calendar.today)).length,
    review: { id: facts.activeReview?.id ?? null, remainingCount: facts.activeReview
      ? reviewQueue([...facts.tasks], [...facts.taskEvents], facts.activeReview, calendar.today).length
      : facts.tasks.filter((item) => isReviewEligible(item, calendar.today)).length },
  }
}

export function mapAvailable<T, U>(input: Available<T>, project: (value: T) => U): Available<U> {
  return input.status === 'ready' || input.status === 'stale' ? { ...input, value: project(input.value) } : { ...input }
}

/** Cheap live projection: no history aggregation or workflow reconciliation. */
export function projectContext(saved: Available<SavedContext>, tasks: Available<readonly TaskIdentity[]>, live: Available<LiveFocus>,
  selectedTaskId: string | null, now: number): ExperienceContext {
  const currentTask = (id: string | null) => mapAvailable(tasks, (items) => {
    const task = items.find((item) => item.id === id)
    return task ? { id: task.id, title: task.title, status: task.status } : null
  })
  const hour = new Date(now).getHours()
  return {
    now, localDate: localCalendarContext(now).today,
    // Prototype convention only; not an interpretation of health, mood, or work.
    dayPhase: hour >= 6 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon'
      : hour >= 18 && hour < 22 ? 'evening' : 'night',
    saved,
    selection: { taskId: selectedTaskId, currentTask: currentTask(selectedTaskId) },
    focus: mapAvailable(live, ({ timer, settings, pendingCompletion, pendingReset, error }) => ({
      mode: timer.mode, status: timer.status, periodId: timer.status === 'idle' ? null : timer.id,
      elapsedMs: elapsedMs(timer, now), remainingMs: remainingMs(timer, settings, now),
      capturedTarget: timer.status === 'idle' ? null : { taskId: timer.taskId, categoryId: timer.categoryId,
        historicalTitle: timer.taskTitleSnapshot },
      currentTarget: currentTask(timer.status === 'idle' ? null : timer.taskId),
      pendingCompletion, pendingReset, error,
    })),
  }
}

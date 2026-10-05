import type { Settings } from './settings'

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

interface StartedTimer {
  mode: TimerMode
  id: string
  startedAt: number
  durationMs: number
  accumulatedMs: number
  taskId: string | null
  categoryId: string | null
}

export type TimerState =
  | { status: 'idle'; mode: TimerMode }
  | (StartedTimer & { status: 'running'; runStartedAt: number })
  | (StartedTimer & { status: 'paused' })
  | (StartedTimer & { status: 'completed'; endedAt: number })

export type TimerAction =
  | { type: 'start'; id: string; taskId?: string | null; categoryId?: string | null }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'reset' }
  | { type: 'selectMode'; mode: TimerMode }

export const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus', shortBreak: 'Short break', longBreak: 'Long break',
}

export function durationForMode(mode: TimerMode, settings: Settings): number {
  const seconds = mode === 'focus' ? settings.focusDurationSeconds
    : mode === 'shortBreak' ? settings.shortBreakDurationSeconds : settings.longBreakDurationSeconds
  return seconds * 1000
}

export function elapsedMs(timer: TimerState, now: number): number {
  if (timer.status === 'idle') return 0
  const segment = timer.status === 'running' ? Math.max(0, now - timer.runStartedAt) : 0
  return Math.min(timer.durationMs, timer.accumulatedMs + segment)
}

export function remainingMs(timer: TimerState, settings: Settings, now: number): number {
  return timer.status === 'idle' ? durationForMode(timer.mode, settings)
    : timer.durationMs - elapsedMs(timer, now)
}

export function reconcileTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running' || elapsedMs(timer, now) < timer.durationMs) return timer
  return {
    status: 'completed', mode: timer.mode, id: timer.id, startedAt: timer.startedAt,
    durationMs: timer.durationMs, accumulatedMs: timer.durationMs,
    taskId: timer.taskId, categoryId: timer.categoryId,
    endedAt: timer.runStartedAt + timer.durationMs - timer.accumulatedMs,
  }
}

/** Save verified progress without changing the effective deadline. Reconcile first. */
export function checkpointTimer(timer: TimerState, now: number): TimerState {
  if (timer.status !== 'running') return timer
  const reconciled = reconcileTimer(timer, now)
  if (reconciled !== timer) return reconciled
  return { ...timer, accumulatedMs: elapsedMs(timer, now), runStartedAt: Math.max(timer.runStartedAt, now) }
}

/** A new/restored page cannot verify time since the last persisted checkpoint. */
export function recoverTimer(timer: TimerState): TimerState {
  if (timer.status !== 'running') return timer
  const { runStartedAt: _runStartedAt, ...progress } = timer
  void _runStartedAt
  return { ...progress, status: 'paused' }
}

/** Pure transitions. The caller must persist reconciled completion before applying an action. */
export function transitionTimer(timer: TimerState, action: TimerAction, settings: Settings, now: number): TimerState {
  switch (action.type) {
    case 'start': {
      if (timer.status !== 'idle' && timer.status !== 'completed') return timer
      const durationMs = durationForMode(timer.mode, settings)
      if (!Number.isFinite(durationMs) || durationMs <= 0) return timer
      return { status: 'running', mode: timer.mode, id: action.id, startedAt: now,
        durationMs, accumulatedMs: 0, runStartedAt: now,
        taskId: timer.mode === 'focus' ? action.taskId ?? null : null,
        categoryId: timer.mode === 'focus' ? action.categoryId ?? null : null }
    }
    case 'pause':
      if (timer.status !== 'running') return timer
      return { status: 'paused', mode: timer.mode, id: timer.id, startedAt: timer.startedAt,
        durationMs: timer.durationMs, accumulatedMs: elapsedMs(timer, now),
        taskId: timer.taskId, categoryId: timer.categoryId }
    case 'resume':
      if (timer.status !== 'paused') return timer
      return { ...timer, status: 'running', runStartedAt: Math.max(timer.startedAt, now) }
    case 'reset':
      return timer.status === 'idle' ? timer : { status: 'idle', mode: timer.mode }
    case 'selectMode':
      if (timer.status !== 'idle' && timer.status !== 'completed') return timer
      return { status: 'idle', mode: action.mode }
  }
}

export function isTimerState(value: unknown, requireTarget = true): value is TimerState {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const timer = value as Record<string, unknown>
  if (!['focus', 'shortBreak', 'longBreak'].includes(String(timer.mode))) return false
  if (timer.status === 'idle') return true
  const reference = (v: unknown) => v === null || (typeof v === 'string' && !!v.trim())
  if (requireTarget && (!reference(timer.taskId) || !reference(timer.categoryId) ||
    (timer.mode !== 'focus' && (timer.taskId !== null || timer.categoryId !== null)) ||
    (timer.taskId === null && timer.categoryId !== null))) return false
  const nonnegative = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0
  if (typeof timer.id !== 'string' || !timer.id.trim() || !nonnegative(timer.startedAt) ||
    !nonnegative(timer.durationMs) || timer.durationMs === 0 || !nonnegative(timer.accumulatedMs)) return false
  if (timer.status === 'completed') {
    return timer.accumulatedMs === timer.durationMs && nonnegative(timer.endedAt) && timer.endedAt >= timer.startedAt
  }
  if (timer.accumulatedMs >= timer.durationMs) return false
  if (timer.status === 'paused') return true
  return timer.status === 'running' && nonnegative(timer.runStartedAt) && timer.runStartedAt >= timer.startedAt
}

export function areEditableDurations(settings: Settings): boolean {
  return Object.values(settings).every((seconds) => Number.isInteger(seconds / 60) && seconds >= 60 && seconds <= 10800)
}

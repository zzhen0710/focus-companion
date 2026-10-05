import type { FocusSession } from '../../domain/focusSession'
import type { Settings } from '../../domain/settings'
import { areEditableDurations, checkpointTimer, recoverTimer, reconcileTimer, transitionTimer } from '../../domain/timer'
import type { TimerAction, TimerMode, TimerState } from '../../domain/timer'
import { createDefaultData } from '../../storage/storage'
import type { AppData, AppStorage } from '../../storage/storage'

export interface TimerSnapshot {
  data: AppData | null
  now: number
  error: string | null
  pendingCompletion: boolean
}

export const CHECKPOINT_INTERVAL_MS = 5000

function completedData(data: AppData, timer: TimerState): AppData {
  if (timer.status !== 'completed') return data
  let sessions = data.sessions
  if (timer.mode === 'focus' && !sessions.some((session) => session.id === timer.id)) {
    const session: FocusSession = {
      id: timer.id, taskId: null, categoryId: null, startedAt: timer.startedAt,
      endedAt: timer.endedAt, durationSeconds: timer.durationMs / 1000,
    }
    sessions = [...sessions, session]
  }
  return { ...data, timer, sessions }
}

/** One application-scoped coordinator. All domain calculations remain pure. */
export function createTimerController(
  storage: AppStorage,
  clock: () => number = Date.now,
  createId: () => string = () => crypto.randomUUID(),
) {
  let snapshot: TimerSnapshot = { data: null, now: clock(), error: null, pendingCompletion: false }
  let pendingData: AppData | null = null
  let recovering = true
  let pendingPause: TimerState | null = null
  let lastCheckpointAt = clock()
  const listeners = new Set<() => void>()

  function publish(data: AppData | null, error: string | null = null) {
    snapshot = { data, now: clock(), error, pendingCompletion: pendingData !== null }
    listeners.forEach((listener) => listener())
  }

  function read() {
    const result = storage.load()
    if (result.status === 'missing') return { data: createDefaultData(), needsSave: true }
    if (result.status === 'ready') return { data: result.data, needsSave: result.needsMigration === true }
    const messages = {
      invalid: 'Stored data could not be read. It has been left untouched.',
      unsupported: 'Stored data uses an unsupported version. It has been left untouched.',
      unavailable: 'Local storage is unavailable. Timer controls are unavailable until you retry.',
    }
    publish(snapshot.data, messages[result.status])
    return null
  }

  function save(data: AppData, isCompletion = false): boolean {
    const result = storage.save(data)
    if (result.status !== 'saved') {
      if (isCompletion) pendingData = data
      publish(isCompletion ? data : snapshot.data,
        isCompletion ? 'This period has ended, but completion could not be saved. Retry before starting another period.'
          : 'Changes could not be saved. The previous timer state has been kept. Please retry.')
      return false
    }
    pendingData = null
    lastCheckpointAt = clock()
    publish(data)
    return true
  }

  // Cold recovery always precedes timestamp reconciliation, including failed-load retries.
  function prepare(): AppData | null {
    const loaded = read()
    if (!loaded) return null
    if (recovering || pendingPause) {
      const current = loaded.data.timer
      if (pendingPause && (current.status === 'idle' || pendingPause.status === 'idle' || current.id !== pendingPause.id)) {
        publish(snapshot.data, 'Stored timer state changed. Paused recovery has been retained; no data was overwritten.')
        return null
      }
      if (current.status === 'completed') {
        pendingPause = null
        recovering = false
        publish(loaded.data)
        return loaded.data
      }
      const paused = pendingPause ?? recoverTimer(current)
      if (paused !== current) {
        pendingPause = paused
        const data = { ...loaded.data, timer: paused }
        if (!save(data)) {
          publish(data, 'Recovered as paused, but progress could not be saved. Please retry before resuming.')
          return null
        }
        pendingPause = null
        recovering = false
        return data
      }
      recovering = false
    }
    const timer = reconcileTimer(loaded.data.timer, clock())
    const completion = timer !== loaded.data.timer
    const data = completion ? completedData(loaded.data, timer) : loaded.data
    if (loaded.needsSave || completion) {
      if (!save(data, completion)) return null
    } else {
      publish(data)
    }
    return data
  }

  function dispatch(action: TimerAction) {
    if (snapshot.error) return
    let data = prepare()
    if (!data) return
    const now = clock()
    const reconciled = reconcileTimer(data.timer, now)
    if (reconciled !== data.timer) {
      data = completedData(data, reconciled)
      if (!save(data, true)) return
    }
    const timer = transitionTimer(data.timer, action, data.settings, now)
    if (timer !== data.timer) save({ ...data, timer })
  }

  function retry() {
    if (!pendingData) {
      prepare()
      return
    }
    const loaded = read()
    if (!loaded) return
    const pendingTimer = pendingData.timer
    const currentTimer = loaded.data.timer
    if (pendingTimer.status !== 'completed' || currentTimer.status === 'idle' || currentTimer.id !== pendingTimer.id) {
      publish(snapshot.data, 'Stored timer state changed. Pending completion has been retained; no data was overwritten.')
      return
    }
    save(completedData(loaded.data, pendingTimer), true)
  }

  prepare()

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    tick() {
      const timer = snapshot.data?.timer
      if (!snapshot.error && timer && reconcileTimer(timer, clock()) !== timer) prepare()
      else if (!snapshot.error && timer?.status === 'running' && clock() - lastCheckpointAt >= CHECKPOINT_INTERVAL_MS) checkpoint()
      else publish(snapshot.data, snapshot.error)
    },
    checkpoint,
    leave() {
      // Leaving the document (including BFCache entry) pauses at trustworthy live time.
      // Even a failed write must not permit restoration to count the absent interval.
      if (snapshot.error || pendingPause) return
      const data = prepare()
      if (!data || data.timer.status !== 'running') return
      const now = clock()
      const reconciled = reconcileTimer(data.timer, now)
      if (reconciled.status === 'completed') {
        save(completedData(data, reconciled), true)
        return
      }
      pendingPause = transitionTimer(data.timer, { type: 'pause' }, data.settings, now)
      recovering = true
      prepare()
    },
    restore() {
      if (pendingData) return
      recovering = true
      prepare()
    },
    start: () => dispatch({ type: 'start', id: createId() }),
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    reset: () => dispatch({ type: 'reset' }),
    selectMode: (mode: TimerMode) => dispatch({ type: 'selectMode', mode }),
    saveSettings(settings: Settings) {
      if (snapshot.error || !areEditableDurations(settings)) return false
      const data = prepare()
      if (!data || (data.timer.status !== 'idle' && data.timer.status !== 'completed')) return false
      return save({ ...data, settings })
    },
    retry,
  }

  function checkpoint() {
    if (snapshot.error || snapshot.data?.timer.status !== 'running') return
    const data = prepare()
    if (!data || data.timer.status !== 'running') return
    const timer = checkpointTimer(data.timer, clock())
    if (timer.status === 'completed') {
      save(completedData(data, timer), true)
      return
    }
    // Avoid redundant lifecycle writes when no progress has accrued.
    if (timer.status === 'running' && timer.accumulatedMs !== data.timer.accumulatedMs) save({ ...data, timer })
  }
}

export type TimerController = ReturnType<typeof createTimerController>

import { describe, expect, it } from 'vitest'
import { createDefaultData } from '../storage/storage'
import { checkpointTimer, recoverTimer, durationForMode, elapsedMs, isTimerState, reconcileTimer, remainingMs, transitionTimer } from './timer'
import type { TimerState } from './timer'

const settings = { ...createDefaultData().settings, focusDurationSeconds: 2 }
const idle: TimerState = { status: 'idle', mode: 'focus' }
const start = () => transitionTimer(idle, { type: 'start', id: 'period-1' }, settings, 1000)

describe('timestamp timer', () => {
  it('checkpoints progress without changing the deadline and recovers only saved progress', () => {
    const timer = checkpointTimer(start(), 1500)
    expect(isTimerState(timer)).toBe(true)
    expect(reconcileTimer(timer, 100000)).toMatchObject({ status: 'completed', endedAt: 3000 })
    const recovered = recoverTimer(timer)
    expect(recovered).toMatchObject({ status: 'paused', accumulatedMs: 500, id: 'period-1' })
    expect(remainingMs(recovered, settings, 100000)).toBe(1500)
    expect(isTimerState(recovered)).toBe(true)
    expect(recoverTimer(recovered)).toBe(recovered)
    const completed = reconcileTimer(start(), 3000)
    expect(recoverTimer(completed)).toBe(completed)
  })

  it('reconciles a checkpoint at the deadline rather than persisting an invalid running state', () => {
    expect(checkpointTimer(start(), 3000)).toMatchObject({ status: 'completed', endedAt: 3000 })
    expect(isTimerState(checkpointTimer(start(), 3000))).toBe(true)
  })

  it('starts with a stable ID and captures the configured duration', () => {
    expect(start()).toEqual({ status: 'running', mode: 'focus', id: 'period-1', startedAt: 1000,
      runStartedAt: 1000, accumulatedMs: 0, durationMs: 2000, taskId: null, categoryId: null })
    expect(remainingMs(start(), { ...settings, focusDurationSeconds: 50 }, 1500)).toBe(1500)
  })

  it('derives exact millisecond time without decrementing a counter', () => {
    expect(elapsedMs(start(), 1501)).toBe(501)
    expect(remainingMs(start(), settings, 1501)).toBe(1499)
    expect(Math.ceil(remainingMs(start(), settings, 2999) / 1000)).toBe(1)
  })

  it('excludes pauses across repeated pause and resume transitions', () => {
    let timer = transitionTimer(start(), { type: 'pause' }, settings, 1500)
    expect(elapsedMs(timer, 10000)).toBe(500)
    timer = transitionTimer(timer, { type: 'resume' }, settings, 10000)
    timer = transitionTimer(timer, { type: 'pause' }, settings, 10500)
    expect(elapsedMs(timer, 20000)).toBe(1000)
    timer = transitionTimer(timer, { type: 'resume' }, settings, 20000)
    expect(reconcileTimer(timer, 21000)).toMatchObject({ status: 'completed', endedAt: 21000, accumulatedMs: 2000 })
  })

  it('completes at the exact deadline and remains completed', () => {
    const timer = start()
    expect(reconcileTimer(timer, 2999)).toBe(timer)
    const completed = reconcileTimer(timer, 3000)
    expect(completed).toMatchObject({ status: 'completed', endedAt: 3000 })
    expect(remainingMs(completed, settings, 5000)).toBe(0)
    expect(reconcileTimer(completed, 10000)).toBe(completed)
  })

  it.each([3500, 60000, 86400000])('recovers delayed callbacks, background or sleep at %s', (now) => {
    expect(reconcileTimer(start(), now)).toMatchObject({ status: 'completed', endedAt: 3000, accumulatedMs: 2000 })
  })

  it('recovers running and paused state from serialized timestamps', () => {
    const running = JSON.parse(JSON.stringify(start())) as TimerState
    expect(remainingMs(running, settings, 2000)).toBe(1000)
    const paused = transitionTimer(running, { type: 'pause' }, settings, 2000)
    const restored = JSON.parse(JSON.stringify(paused)) as TimerState
    expect(reconcileTimer(restored, 86400000)).toEqual(paused)
    expect(remainingMs(restored, settings, 86400000)).toBe(1000)
  })

  it('clamps negative clock deltas', () => {
    expect(elapsedMs(start(), 500)).toBe(0)
    const paused = transitionTimer(start(), { type: 'pause' }, settings, 1500)
    const resumed = transitionTimer(paused, { type: 'resume' }, settings, 500)
    expect(elapsedMs(resumed, 500)).toBe(500)
  })

  it('ignores invalid controls and prohibits switching an active mode', () => {
    expect(transitionTimer(idle, { type: 'pause' }, settings, 1000)).toBe(idle)
    const running = start()
    expect(transitionTimer(running, { type: 'resume' }, settings, 2000)).toBe(running)
    expect(transitionTimer(running, { type: 'start', id: 'another' }, settings, 2000)).toBe(running)
    expect(transitionTimer(running, { type: 'selectMode', mode: 'longBreak' }, settings, 2000)).toBe(running)
  })

  it('resets active state and starts a new period with a new ID', () => {
    const reset = transitionTimer(start(), { type: 'reset' }, settings, 1500)
    expect(reset).toEqual(idle)
    const completed = reconcileTimer(start(), 3000)
    expect(transitionTimer(completed, { type: 'start', id: 'period-2' }, settings, 5000)).toMatchObject({ id: 'period-2', startedAt: 5000 })
  })

  it('selects short and long breaks manually without automatic cycles', () => {
    const selected = transitionTimer(idle, { type: 'selectMode', mode: 'longBreak' }, settings, 1000)
    expect(durationForMode(selected.mode, settings)).toBe(900000)
    expect(durationForMode('shortBreak', settings)).toBe(300000)
    const completed = reconcileTimer(start(), 86400000)
    expect(completed.mode).toBe('focus')
    expect(completed.status).toBe('completed')
  })

  it('validates state-specific timestamp and accumulation invariants', () => {
    expect(isTimerState(start())).toBe(true)
    expect(isTimerState(reconcileTimer(start(), 3000))).toBe(true)
    expect(isTimerState({ ...start(), accumulatedMs: 2000 })).toBe(false)
    expect(isTimerState({ ...start(), runStartedAt: 500 })).toBe(false)
    expect(isTimerState({ status: 'completed', mode: 'focus' })).toBe(false)
    expect(isTimerState({ status: 'idle', mode: 'unknown' })).toBe(false)
    expect(isTimerState(null)).toBe(false)
  })
})

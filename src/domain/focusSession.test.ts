import { describe, expect, it } from 'vitest'
import { focusRecord } from './focusSession'
import { createDefaultData } from '../storage/storage'
import { transitionTimer, reconcileTimer } from './timer'
const settings = createDefaultData().settings
describe('trusted Focus records', () => {
  it('floors interrupted seconds without counting pauses and uses effective natural deadline', () => {
    const running = transitionTimer({ status: 'idle', mode: 'focus' }, { type: 'start', id: 'focus' }, settings, 1000)
    expect(focusRecord(running, 1999)).toBeNull()
    const paused = transitionTimer(running, { type: 'pause' }, settings, 2500)
    expect(focusRecord(paused, 100000)).toMatchObject({ outcome: 'interrupted', durationSeconds: 1, plannedDurationSeconds: 1500 })
    const completed = reconcileTimer(running, 9999999)
    expect(focusRecord(completed, 9999999)).toMatchObject({ outcome: 'completed', durationSeconds: 1500, endedAt: 1501000 })
  })
  it('does not create records from idle or Break states', () => {
    expect(focusRecord({ status: 'idle', mode: 'focus' }, 1000)).toBeNull()
    const timer = transitionTimer({ status: 'idle', mode: 'longBreak' }, { type: 'start', id: 'break' }, settings, 0)
    expect(focusRecord(timer, 10000)).toBeNull()
  })
})

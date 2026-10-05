import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter, STORAGE_KEY } from '../../storage/localStorageAdapter'
import { createDefaultData } from '../../storage/storage'
import type { AppData } from '../../storage/storage'
import { createTimerController } from './timerController'
import { attachTimerLifecycle } from './timerLifecycle'

function fixture(data: AppData = createDefaultData()) {
  let raw = JSON.stringify(data)
  let now = 1000
  let nextId = 0
  let failWrite = false
  let failRead = false
  let writes = 0
  const storage = createLocalStorageAdapter(() => ({
    getItem: (key) => {
      expect(key).toBe(STORAGE_KEY)
      if (failRead) throw new Error('Read denied')
      return raw
    },
    setItem: (_key, value) => {
      if (failWrite) throw new Error('Write denied')
      raw = value
      writes += 1
    },
  }))
  const create = () => createTimerController(storage, () => now, () => `period-${++nextId}`)
  return {
    controller: create(), create,
    at: (value: number) => { now = value },
    failWrites: (value: boolean) => { failWrite = value },
    failReads: (value: boolean) => { failRead = value },
    stored: () => JSON.parse(raw) as AppData,
    replace: (value: AppData) => { raw = JSON.stringify(value) },
    writes: () => writes,
  }
}

function shortData() {
  const data = createDefaultData()
  data.settings.focusDurationSeconds = 2
  data.settings.shortBreakDurationSeconds = 1
  data.settings.longBreakDurationSeconds = 3
  return data
}

describe('timer persistence coordinator', () => {
  it('saves migration on startup with an already completed legacy timer without creating a new session', () => {
    const data = shortData()
    const old = { ...data, schemaVersion: 2,
      timer: { status: 'completed', mode: 'focus', id: 'old', startedAt: 1000, durationMs: 2000, accumulatedMs: 2000, endedAt: 3000 },
      sessions: [{ id: 'old', taskId: null, categoryId: null, startedAt: 1000, endedAt: 3000, durationSeconds: 2 }] }
    let raw = JSON.stringify(old)
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } }))
    const controller = createTimerController(storage, () => 100000)
    expect(controller.getSnapshot().error).toBeNull()
    expect(JSON.parse(raw)).toMatchObject({ schemaVersion: 3, timer: { status: 'completed', id: 'old' } })
    expect(JSON.parse(raw).sessions).toEqual(old.sessions)
  })
  it('checkpoints every five seconds while keeping the live deadline unchanged', () => {
    const f = fixture()
    f.controller.start()
    f.at(5999)
    f.controller.tick()
    expect(f.writes()).toBe(1)
    f.at(6000)
    f.controller.tick()
    expect(f.writes()).toBe(2)
    expect(f.stored().timer).toMatchObject({ status: 'running', accumulatedMs: 5000, runStartedAt: 6000 })
    f.at(11000)
    f.controller.tick()
    expect(f.stored().timer).toMatchObject({ accumulatedMs: 10000, runStartedAt: 11000 })
    f.at(1501000)
    f.controller.tick()
    expect(f.stored().sessions[0].endedAt).toBe(1501000)
  })

  it('continues in a background tab and on freeze/resume without pausing', () => {
    const f = fixture(shortData())
    const document = new EventTarget()
    const window = new EventTarget()
    const detach = attachTimerLifecycle(f.controller, document, window)
    f.controller.start()
    f.at(1500)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(f.stored().timer).toMatchObject({ status: 'running', accumulatedMs: 500 })
    document.dispatchEvent(new Event('freeze'))
    f.at(100000)
    document.dispatchEvent(new Event('resume'))
    expect(f.stored().sessions).toHaveLength(1)
    expect(f.stored().sessions[0].endedAt).toBe(3000)
    detach()
  })

  it('recovers same-instance sleep/wake using timestamps even without lifecycle events', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(86400000)
    f.controller.tick()
    expect(f.stored().timer).toMatchObject({ status: 'completed', endedAt: 3000 })
    expect(f.stored().sessions).toHaveLength(1)
  })

  it('never awards completion on a new instance without any departure event or checkpoint', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(86400000)
    const reopened = f.create()
    reopened.tick()
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 0 })
    expect(f.stored().sessions).toEqual([])
  })

  it('keeps cold recovery conservative across failed reads and failed recovery writes', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(1500)
    f.controller.checkpoint()
    f.at(100000)
    f.failReads(true)
    const restored = f.create()
    f.failReads(false)
    f.failWrites(true)
    restored.retry()
    expect(restored.getSnapshot().data?.timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    restored.resume()
    expect(f.stored().timer.status).toBe('running')
    f.at(200000)
    f.failWrites(false)
    restored.retry()
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    expect(f.stored().sessions).toEqual([])
  })

  it('reports failed checkpoints, retains running timestamps, and reconciles on same-instance retry', () => {
    const f = fixture()
    f.controller.start()
    f.failWrites(true)
    f.at(6000)
    f.controller.tick()
    expect(f.controller.getSnapshot().error).not.toBeNull()
    expect(f.stored().timer).toMatchObject({ accumulatedMs: 0, runStartedAt: 1000 })
    f.failWrites(false)
    f.at(1501000)
    f.controller.retry()
    expect(f.stored().sessions).toHaveLength(1)
  })

  it.each([false, true])('pauses BFCache restoration with failed departure write = %s', (fail) => {
    const f = fixture(shortData())
    const document = new EventTarget()
    const window = new EventTarget()
    const detach = attachTimerLifecycle(f.controller, document, window)
    f.controller.start()
    f.at(1500)
    f.failWrites(fail)
    window.dispatchEvent(new Event('pagehide'))
    f.at(100000)
    const event = new Event('pageshow')
    Object.defineProperty(event, 'persisted', { value: true })
    window.dispatchEvent(event)
    f.failWrites(false)
    f.controller.retry()
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    expect(f.stored().sessions).toEqual([])
    detach()
  })

  it('restores BFCache conservatively even if the departure event was missed', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(1500)
    f.controller.checkpoint()
    f.at(100000)
    f.controller.restore()
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    expect(f.stored().sessions).toEqual([])
  })

  it('preserves an already saved completion when paused recovery is retried', () => {
    const f = fixture(shortData())
    f.controller.start()
    const running = f.stored()
    f.at(1500)
    f.failWrites(true)
    f.controller.leave()
    f.failWrites(false)
    const completed = { ...running, timer: { status: 'completed' as const, mode: 'focus' as const,
      id: 'period-1', startedAt: 1000, durationMs: 2000, accumulatedMs: 2000, endedAt: 3000, taskId: null, categoryId: null },
      sessions: [{ id: 'period-1', taskId: null, categoryId: null, startedAt: 1000, endedAt: 3000, durationSeconds: 2 }] }
    f.replace(completed)
    f.controller.retry()
    expect(f.stored()).toEqual(completed)
    expect(f.controller.getSnapshot().data?.timer.status).toBe('completed')
  })

  it('retains same-instance pending completion across BFCache restoration and saves it once', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(3000)
    f.failWrites(true)
    f.controller.tick()
    f.controller.restore()
    expect(f.controller.getSnapshot().pendingCompletion).toBe(true)
    f.failWrites(false)
    f.controller.retry()
    f.controller.restore()
    expect(f.stored().sessions).toHaveLength(1)
  })

  it('initializes missing storage and keeps controls blocked until a failed write is retried', () => {
    let raw: string | null = null
    let fail = true
    const storage = createLocalStorageAdapter(() => ({
      getItem: () => raw,
      setItem: (_key, value) => {
        if (fail) throw new Error('Quota')
        raw = value
      },
    }))
    const controller = createTimerController(storage, () => 1000, () => 'period')
    expect(controller.getSnapshot().error).not.toBeNull()
    controller.start()
    expect(raw).toBeNull()
    fail = false
    controller.retry()
    expect(controller.getSnapshot().data).toEqual(createDefaultData())
    expect(JSON.parse(raw!)).toEqual(createDefaultData())
  })

  it('saves the validated v1 migration through the controller and preserves settings', () => {
    const data = createDefaultData()
    const { timer: _timer, ...old } = data
    void _timer
    const legacy = { ...old, schemaVersion: 1 }
    let raw = JSON.stringify(legacy)
    const storage = createLocalStorageAdapter(() => ({ getItem: () => raw, setItem: (_key, value) => { raw = value } }))
    const controller = createTimerController(storage, () => 1000)
    expect(controller.getSnapshot().error).toBeNull()
    expect(JSON.parse(raw)).toEqual(data)
  })

  it('leaves invalid storage untouched and blocks timer actions', () => {
    let writes = 0
    const storage = createLocalStorageAdapter(() => ({ getItem: () => '{broken', setItem: () => { writes += 1 } }))
    const controller = createTimerController(storage, () => 1000)
    controller.start()
    controller.reset()
    controller.retry()
    expect(controller.getSnapshot().data).toBeNull()
    expect(writes).toBe(0)
  })

  it('persists transitions, but not ordinary countdown ticks', () => {
    const f = fixture(shortData())
    f.controller.start()
    expect(f.stored().timer.status).toBe('running')
    f.at(1500)
    f.controller.tick()
    expect(f.writes()).toBe(1)
    f.controller.pause()
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    f.at(10000)
    f.controller.resume()
    expect(f.stored().timer).toMatchObject({ status: 'running', runStartedAt: 10000 })
  })

  it('writes completed state and exactly one focus record together', () => {
    const f = fixture(shortData())
    f.controller.start()
    expect(f.stored().sessions).toEqual([])
    f.at(3000)
    f.controller.tick()
    expect(f.stored().timer.status).toBe('completed')
    expect(f.stored().sessions).toEqual([{ id: 'period-1', taskId: null, categoryId: null, startedAt: 1000, endedAt: 3000, durationSeconds: 2 }])
    f.controller.tick()
    f.create().tick()
    expect(f.stored().sessions).toHaveLength(1)
    expect(f.writes()).toBe(2)
  })

  it.each(['refresh', 'close/reopen'])('recovers Running as Paused on %s without counting absent time', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(2000)
    f.controller.checkpoint()
    f.at(100000)
    const restored = f.create()
    expect(restored.getSnapshot()).toMatchObject({ data: { timer: { status: 'paused', accumulatedMs: 1000 } } })
    restored.tick()
    expect(f.stored().sessions).toHaveLength(0)
    restored.resume()
    f.at(101000)
    restored.tick()
    expect(f.stored().sessions).toEqual([{ id: 'period-1', taskId: null, categoryId: null, startedAt: 1000, endedAt: 101000, durationSeconds: 2 }])
  })

  it('keeps a paused period frozen after refresh and sleep', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(1500)
    f.controller.pause()
    f.at(86400000)
    const restored = f.create()
    restored.tick()
    expect(restored.getSnapshot().data?.timer).toMatchObject({ status: 'paused', accumulatedMs: 500 })
    expect(f.stored().sessions).toEqual([])
  })

  it('records running time only, using the effective deadline after pauses', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(1500)
    f.controller.pause()
    f.at(10000)
    f.controller.resume()
    f.at(50000)
    f.controller.tick()
    expect(f.stored().sessions[0]).toMatchObject({ startedAt: 1000, endedAt: 11500, durationSeconds: 2 })
  })

  it.each(['running', 'paused'])('abandons an unfinished %s period on reset without a record', (state) => {
    const f = fixture(shortData())
    f.controller.start()
    f.at(1500)
    if (state === 'paused') f.controller.pause()
    f.controller.reset()
    expect(f.stored().timer).toEqual({ status: 'idle', mode: 'focus' })
    expect(f.stored().sessions).toEqual([])
  })

  it('reconciles an overdue period before reset or pause', () => {
    for (const action of ['reset', 'pause'] as const) {
      const f = fixture(shortData())
      f.controller.start()
      f.at(3000)
      f.controller[action]()
      expect(f.stored().sessions).toHaveLength(1)
      expect(f.stored().timer.status).toBe(action === 'reset' ? 'idle' : 'completed')
    }
  })

  it.each(['shortBreak', 'longBreak'] as const)('completes %s without a FocusSession or another automatic period', (mode) => {
    const f = fixture(shortData())
    f.controller.selectMode(mode)
    f.controller.start()
    f.at(86400000)
    f.controller.tick()
    expect(f.stored().timer).toMatchObject({ status: 'completed', mode })
    expect(f.stored().sessions).toEqual([])
  })

  it('retains failed completion, blocks new periods, and retries with the same ID once', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.failWrites(true)
    f.at(3000)
    f.controller.tick()
    expect(f.controller.getSnapshot()).toMatchObject({ pendingCompletion: true, data: { timer: { status: 'completed' } } })
    expect(f.stored().timer.status).toBe('running')
    expect(f.stored().sessions).toEqual([])
    f.controller.start()
    f.controller.reset()
    expect(f.controller.getSnapshot().data?.timer.status).toBe('completed')
    f.failWrites(false)
    f.controller.retry()
    f.controller.retry()
    expect(f.stored().sessions).toHaveLength(1)
    expect(f.stored().sessions[0].id).toBe('period-1')
    expect(f.controller.getSnapshot().error).toBeNull()
  })

  it('does not infer an unsaved completion from old running timestamps after reopening', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.failWrites(true)
    f.at(3000)
    f.controller.tick()
    f.failWrites(false)
    f.create()
    expect(f.stored().sessions).toHaveLength(0)
    expect(f.stored().timer).toMatchObject({ status: 'paused', accumulatedMs: 0 })
  })

  it('keeps the previous state when a user transition fails to save', () => {
    const f = fixture(shortData())
    f.failWrites(true)
    f.controller.start()
    expect(f.controller.getSnapshot().data?.timer.status).toBe('idle')
    expect(f.stored().timer.status).toBe('idle')
    f.failWrites(false)
    f.controller.retry()
    f.controller.start()
    f.at(1500)
    f.failWrites(true)
    f.controller.pause()
    expect(f.stored().timer.status).toBe('running')
    expect(f.controller.getSnapshot().data?.timer.status).toBe('running')
  })

  it('preserves unrelated records from the latest stored document', () => {
    const f = fixture(shortData())
    f.controller.start()
    const latest = f.stored()
    latest.tasks.push({ id: 'task', title: 'Keep', categoryId: null, completed: false, createdAt: 0, completedAt: null, content: null, schedule: { kind: 'unscheduled' } })
    latest.sessions.push({ id: 'old', taskId: null, categoryId: null, startedAt: 0, endedAt: 1000, durationSeconds: 1 })
    f.replace(latest)
    f.at(3000)
    f.controller.tick()
    expect(f.stored().tasks).toEqual(latest.tasks)
    expect(f.stored().sessions.map((session) => session.id)).toEqual(['old', 'period-1'])
    f.controller.reset()
    expect(f.stored().sessions).toHaveLength(2)
  })

  it('does not duplicate an existing completion ID', () => {
    const f = fixture(shortData())
    f.controller.start()
    const latest = f.stored()
    latest.sessions.push({ id: 'period-1', taskId: null, categoryId: null, startedAt: 1000, endedAt: 3000, durationSeconds: 2 })
    f.replace(latest)
    f.at(3000)
    f.controller.tick()
    expect(f.stored().sessions).toHaveLength(1)
  })

  it('surfaces denied storage access and permits retry', () => {
    const f = fixture(shortData())
    f.failReads(true)
    f.controller.start()
    expect(f.controller.getSnapshot().error).not.toBeNull()
    expect(f.writes()).toBe(0)
    f.failReads(false)
    f.controller.retry()
    expect(f.controller.getSnapshot().error).toBeNull()
  })

  it('validates duration settings and refuses edits during active periods', () => {
    const f = fixture()
    expect(f.controller.saveSettings({ ...createDefaultData().settings, focusDurationSeconds: 61 })).toBe(false)
    expect(f.controller.saveSettings({ ...createDefaultData().settings, focusDurationSeconds: 60 })).toBe(true)
    f.controller.start()
    expect(f.controller.saveSettings(createDefaultData().settings)).toBe(false)
    expect(f.stored().settings.focusDurationSeconds).toBe(60)
  })

  it('retains pending completion when stored timer identity changes', () => {
    const f = fixture(shortData())
    f.controller.start()
    f.failWrites(true)
    f.at(3000)
    f.controller.tick()
    const latest = f.stored()
    latest.timer = { status: 'idle', mode: 'focus' }
    f.replace(latest)
    f.failWrites(false)
    f.controller.retry()
    expect(f.controller.getSnapshot().pendingCompletion).toBe(true)
    expect(f.stored()).toEqual(latest)
  })
})

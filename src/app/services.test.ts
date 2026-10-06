import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultData } from '../storage/storage'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules() })
describe('successful application writes refresh Insights', () => {
  it('refreshes Task and Focus facts through existing composition; read queries add no writes', async () => {
    vi.resetModules(); vi.useFakeTimers()
    const now = new Date(2026, 9, 6, 12).getTime(); vi.setSystemTime(now)
    let raw = JSON.stringify(createDefaultData()), writes = 0, fail = false
    vi.stubGlobal('window', { localStorage: { getItem: () => raw, setItem: (_key: string, value: string) => {
      if (fail) throw new Error('storage unavailable')
      raw = value; writes++
    } } })
    const { taskService, timerController, insightsService, reviewService } = await import('./services')
    const created = taskService.create({ title: 'Task', content: null, categoryId: null, schedule: { kind: 'unscheduled' } })
    expect(created.ok).toBe(true)
    if (!created.ok) throw new Error('creation failed')
    expect(insightsService.query('today')?.tasks.now.openCount).toBe(1)
    taskService.setCompleted(created.id, true)
    expect(insightsService.query('today')?.tasks).toMatchObject({ now: { openCount: 0 }, activity: { completions: 1 } })
    fail = true; taskService.setCompleted(created.id, false)
    expect(insightsService.query('today')?.tasks.now.openCount).toBe(0)
    fail = false
    const data = JSON.parse(raw); data.settings.focusDurationSeconds = 1; raw = JSON.stringify(data)
    timerController.retry(); timerController.start()
    vi.setSystemTime(now + 1000); timerController.tick()
    expect(insightsService.query('today')?.focus).toMatchObject({ focusedSeconds: 1, completedCount: 1 })
    const overdue = taskService.create({ title: 'Review task', content: null, categoryId: null,
      schedule: { kind: 'date', date: '2026-10-05', timeRange: null } })
    if (!overdue.ok) throw new Error('review task creation failed')
    reviewService.open()
    const reviewId = reviewService.getSnapshot().data?.activeReview?.id
    expect(reviewId).toBeDefined()
    reviewService.resolve(reviewId!, overdue.id, { type: 'complete' })
    expect(insightsService.query('today')?.review).toMatchObject({ completedCount: 1, actions: { completions: 1 } })
    const before = raw, priorWrites = writes
    insightsService.query('today'); insightsService.query('week'); insightsService.reload()
    expect(raw).toBe(before); expect(writes).toBe(priorWrites)
  })
})

describe('Task completion and Focus outcomes remain independent', () => {
  it.each(['manual Task completion', 'natural Focus completion', 'Task completion then unfinished Focus Reset'] as const)(
    '%s updates only its own recorded outcomes', async (scenario) => {
      vi.resetModules(); vi.useFakeTimers()
      const now = new Date(2026, 9, 6, 12).getTime(); vi.setSystemTime(now)
      const data = createDefaultData()
      data.settings.focusDurationSeconds = 60
      let raw = JSON.stringify(data)
      vi.stubGlobal('window', { localStorage: { getItem: () => raw,
        setItem: (_key: string, value: string) => { raw = value } } })
      const { taskService, timerController, insightsService } = await import('./services')
      const created = taskService.create({ title: 'Independent outcomes', content: null, categoryId: null, schedule: { kind: 'unscheduled' } })
      if (!created.ok) throw new Error('task creation failed')

      if (scenario !== 'manual Task completion') expect(timerController.start(created.id)).toBe(true)
      if (scenario === 'natural Focus completion') {
        vi.setSystemTime(now + 60_000)
        timerController.tick(); timerController.tick()
        expect(taskService.getSnapshot().data?.tasks[0]).toMatchObject({ status: 'open', completedAt: null })
        expect(JSON.parse(raw).taskEvents).toEqual([])
        expect(JSON.parse(raw).sessions).toHaveLength(1)
        expect(insightsService.query('today')).toMatchObject({
          tasks: { activity: { completions: 0 } }, focus: { completedCount: 1, interruptedCount: 0 },
        })
      } else {
        expect(taskService.setCompleted(created.id, true).ok).toBe(true)
        expect(JSON.parse(raw).sessions).toEqual([])
        expect(insightsService.query('today')).toMatchObject({
          tasks: { activity: { completions: 1 } }, focus: { completedCount: 0, interruptedCount: 0 },
        })
        if (scenario === 'Task completion then unfinished Focus Reset') {
          vi.setSystemTime(now + 1500)
          timerController.reset(); timerController.reset()
          expect(JSON.parse(raw).timer.status).toBe('idle')
          expect(JSON.parse(raw).sessions).toHaveLength(1)
          expect(JSON.parse(raw).sessions[0]).toMatchObject({ taskId: created.id, outcome: 'interrupted', durationSeconds: 1 })
          expect(insightsService.query('today')).toMatchObject({
            tasks: { activity: { completions: 1 } }, focus: { completedCount: 0, interruptedCount: 1 },
          })
        }
        expect(JSON.parse(raw).taskEvents.map((event: { type: string }) => event.type)).toEqual(['taskCompleted'])
        expect(taskService.getSnapshot().data?.tasks[0].status).toBe('completed')
      }
    })
})

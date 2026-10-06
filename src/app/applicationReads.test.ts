import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachApplicationReads } from './applicationReads'
afterEach(() => vi.useRealTimers())
describe('application read ownership', () => {
  it('refreshes both closed-card services through one minute binding and cleans up', () => {
    vi.useFakeTimers()
    const history = { reload: vi.fn() }, insights = { reload: vi.fn() }
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
    const win = Object.assign(new EventTarget(), { setInterval: (fn: TimerHandler, ms?: number) => Number(setInterval(fn as () => void, ms)),
      clearInterval: (id: number) => clearInterval(id) })
    const detach = attachApplicationReads(history, insights, doc, win)
    expect(vi.getTimerCount()).toBe(1)
    expect(history.reload).toHaveBeenCalledTimes(1); expect(insights.reload).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    win.dispatchEvent(Object.assign(new Event('storage'), { key: 'focus-companion:data' }))
    expect(history.reload).toHaveBeenCalledTimes(3); expect(insights.reload).toHaveBeenCalledTimes(3)
    detach(); expect(vi.getTimerCount()).toBe(0)
    win.dispatchEvent(new Event('focus')); expect(history.reload).toHaveBeenCalledTimes(3)
  })
})

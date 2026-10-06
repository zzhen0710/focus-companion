import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachReadRefresh } from './readRefresh'
import { STORAGE_KEY } from '../storage/localStorageAdapter'

afterEach(() => vi.useRealTimers())
describe('read-page refresh lifecycle', () => {
  it('refreshes at low frequency, on return and data changes, then removes all bindings', () => {
    vi.useFakeTimers()
    const doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
    const win = Object.assign(new EventTarget(), {
      setInterval: (handler: TimerHandler, timeout?: number) => Number(setInterval(handler as () => void, timeout)),
      clearInterval: (id: number) => clearInterval(id),
    })
    const reload = vi.fn(), detach = attachReadRefresh(reload, doc, win)
    vi.advanceTimersByTime(59_999); expect(reload).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1); expect(reload).toHaveBeenCalledTimes(1)
    doc.visibilityState = 'hidden'; doc.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(60_000); expect(reload).toHaveBeenCalledTimes(1)
    doc.visibilityState = 'visible'; doc.dispatchEvent(new Event('visibilitychange'))
    win.dispatchEvent(new Event('focus')); win.dispatchEvent(new Event('pageshow'))
    expect(reload).toHaveBeenCalledTimes(4)
    win.dispatchEvent(Object.assign(new Event('storage'), { key: 'focus-companion:ui:task-view' }))
    expect(reload).toHaveBeenCalledTimes(4)
    win.dispatchEvent(Object.assign(new Event('storage'), { key: STORAGE_KEY }))
    win.dispatchEvent(Object.assign(new Event('storage'), { key: null }))
    expect(reload).toHaveBeenCalledTimes(6)
    detach(); vi.advanceTimersByTime(60_000)
    doc.dispatchEvent(new Event('visibilitychange')); win.dispatchEvent(new Event('focus'))
    win.dispatchEvent(new Event('pageshow')); win.dispatchEvent(Object.assign(new Event('storage'), { key: STORAGE_KEY }))
    expect(reload).toHaveBeenCalledTimes(6)
  })
})

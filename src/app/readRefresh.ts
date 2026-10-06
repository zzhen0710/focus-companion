import { STORAGE_KEY } from '../storage/localStorageAdapter'

/** Read-page freshness only; never reconcile timers or write application data. */
export function attachReadRefresh(reload: () => void, doc: Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>,
  win: Pick<Window, 'addEventListener' | 'removeEventListener' | 'setInterval' | 'clearInterval'>) {
  const visible = () => { if (doc.visibilityState === 'visible') reload() }
  const storageChanged = (event: Event) => {
    if ((event as StorageEvent).key === STORAGE_KEY || (event as StorageEvent).key === null) reload()
  }
  // Once per minute while visible handles midnight/timezone changes without display-rate polling.
  const interval = win.setInterval(visible, 60_000)
  doc.addEventListener('visibilitychange', visible)
  win.addEventListener('focus', visible)
  win.addEventListener('pageshow', visible)
  win.addEventListener('storage', storageChanged)
  return () => {
    win.clearInterval(interval)
    doc.removeEventListener('visibilitychange', visible)
    win.removeEventListener('focus', visible)
    win.removeEventListener('pageshow', visible)
    win.removeEventListener('storage', storageChanged)
  }
}

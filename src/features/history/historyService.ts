import type { AppStorage } from '../../storage/storage'
import { historyEntries, groupHistory } from '../../domain/history'

export function createHistoryService(storage: Pick<AppStorage, 'load'>, clock: () => number = Date.now) {
  let snapshot: { groups: ReturnType<typeof groupHistory>; referenceTime: number; error: string | null } = {
    groups: [], referenceTime: clock(), error: null }
  const listeners = new Set<() => void>()
  function reload() {
    const result = storage.load()
    snapshot = result.status === 'ready' && !result.needsMigration
      ? { groups: groupHistory(historyEntries(result.data)), referenceTime: clock(), error: null }
      : { ...snapshot, error: 'History could not be loaded. Stored data was left untouched.' }
    listeners.forEach((listener) => listener())
  }
  reload()
  return { reload, getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } } }
}

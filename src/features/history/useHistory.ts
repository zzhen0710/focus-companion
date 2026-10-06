import { useSyncExternalStore } from 'react'
import { historyService } from '../../app/services'
export function useHistory() {
  const snapshot = useSyncExternalStore(historyService.subscribe, historyService.getSnapshot)
  return snapshot
}

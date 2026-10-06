import { useEffect, useSyncExternalStore } from 'react'
import { historyService } from '../../app/services'
import { attachReadRefresh } from '../../app/readRefresh'
export function useHistory() {
  const snapshot = useSyncExternalStore(historyService.subscribe, historyService.getSnapshot)
  useEffect(() => {
    historyService.reload()
    return attachReadRefresh(historyService.reload, document, window)
  }, [])
  return snapshot
}

import { useEffect } from 'react'
import { historyService, insightsService } from './services'
import { attachApplicationReads } from './applicationReads'

/** One application-lifetime read binding, independent of which card is mounted. */
export function useApplicationReads() {
  useEffect(() => {
    return attachApplicationReads(historyService, insightsService, document, window)
  }, [])
}

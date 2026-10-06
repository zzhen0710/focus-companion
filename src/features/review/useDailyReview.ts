import { useEffect, useSyncExternalStore } from 'react'
import { reviewService } from '../../app/services'
import { localCalendarDate } from '../../domain/taskSchedule'
export function useDailyReview(now: number, safe: boolean) {
  const snapshot = useSyncExternalStore(reviewService.subscribe, reviewService.getSnapshot)
  const today = localCalendarDate(now)
  useEffect(() => {
    if (!safe) return
    reviewService.reload()
  }, [safe, today])
  useEffect(() => {
    const reload = () => reviewService.reload()
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])
  return { snapshot, service: reviewService }
}

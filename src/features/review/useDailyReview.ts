import { useEffect, useRef, useSyncExternalStore } from 'react'
import { reviewService } from '../../app/services'
import { localCalendarDate } from '../../domain/taskSchedule'
export function useDailyReview(now: number, safe: boolean) {
  const snapshot = useSyncExternalStore(reviewService.subscribe, reviewService.getSnapshot)
  const entered = useRef(false)
  const today = localCalendarDate(now)
  useEffect(() => {
    if (!safe) return
    if (!entered.current) { entered.current = true; reviewService.enter() }
    else reviewService.reload()
  }, [safe, today])
  useEffect(() => {
    const reload = () => reviewService.reload()
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [])
  return { snapshot, service: reviewService }
}

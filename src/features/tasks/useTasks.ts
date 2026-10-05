import { useEffect, useSyncExternalStore } from 'react'
import { taskService } from '../../app/services'

export function useTasks() {
  const snapshot = useSyncExternalStore(taskService.subscribe, taskService.getSnapshot)
  useEffect(() => {
    const reload = () => taskService.reload()
    window.addEventListener('focus', reload)
    window.addEventListener('pageshow', reload)
    return () => {
      window.removeEventListener('focus', reload)
      window.removeEventListener('pageshow', reload)
    }
  }, [])
  return { snapshot, service: taskService }
}

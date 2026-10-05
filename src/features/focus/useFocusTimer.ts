import { useEffect, useSyncExternalStore } from 'react'
import { createLocalStorageAdapter } from '../../storage/localStorageAdapter'
import { createTimerController } from './timerController'
import { attachTimerLifecycle } from './timerLifecycle'

// Bootstrap once per module load, independent of React's render and StrictMode effects.
const controller = createTimerController(createLocalStorageAdapter())

/** Mount at App level so navigation away from Focus does not stop reconciliation. */
export function useFocusTimer() {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot)

  useEffect(() => {
    const update = () => controller.tick()
    update()
    const interval = window.setInterval(update, 1000)
    const detach = attachTimerLifecycle(controller, document, window)
    return () => {
      window.clearInterval(interval)
      detach()
    }
  }, [])

  return { snapshot, controller }
}

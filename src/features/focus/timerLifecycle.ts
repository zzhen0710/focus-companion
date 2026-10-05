import type { TimerController } from './timerController'

/** Lifecycle signals improve precision; cold recovery does not depend on them. */
export function attachTimerLifecycle(controller: TimerController, document: EventTarget, window: EventTarget) {
  const checkpoint = () => controller.checkpoint()
  const wake = () => { controller.tick(); controller.checkpoint() }
  const leave = () => controller.leave()
  const restore = (event: Event) => {
    if ((event as PageTransitionEvent).persisted) controller.restore()
    else wake()
  }
  document.addEventListener('visibilitychange', wake)
  document.addEventListener('freeze', checkpoint)
  document.addEventListener('resume', wake)
  window.addEventListener('focus', wake)
  window.addEventListener('pagehide', leave)
  window.addEventListener('pageshow', restore)
  return () => {
    document.removeEventListener('visibilitychange', wake)
    document.removeEventListener('freeze', checkpoint)
    document.removeEventListener('resume', wake)
    window.removeEventListener('focus', wake)
    window.removeEventListener('pagehide', leave)
    window.removeEventListener('pageshow', restore)
  }
}

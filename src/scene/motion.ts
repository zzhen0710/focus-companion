import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'

// Durations/easings are authored once in MainScene.css; browser helpers read them.
export function motionTokens(element: Element) {
  const style = getComputedStyle(element)
  const time = (name: string) => Number.parseFloat(style.getPropertyValue(`--motion-${name}`)) || 0
  return { fast: time('fast'), standard: time('standard'), slow: time('slow'),
    enter: style.getPropertyValue('--ease-enter').trim() || 'ease-out',
    exit: style.getPropertyValue('--ease-exit').trim() || 'ease-in',
    move: style.getPropertyValue('--ease-move').trim() || 'ease-out' }
}
const reducedQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)')
function subscribeReduced(listener: () => void) {
  const query = reducedQuery(); query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => reducedQuery().matches, () => false)
}

/** Visual-only lifetime, with completion and a bounded fallback. Never runs commands. */
export function animateVisual(element: HTMLElement, frames: Keyframe[], duration: number, easing: string, done = () => {}, delay = 0) {
  if (!duration || !element.animate) { done(); return () => {} }
  const animation = element.animate(frames, { duration, easing, delay, fill: 'both' })
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true; clearTimeout(fallback); animation.cancel(); done()
  }
  const fallback = setTimeout(finish, duration + delay + 50)
  animation.finished.then(finish, finish)
  return () => { if (!finished) { finished = true; clearTimeout(fallback); animation.cancel() } }
}

export function useVisibilityMotion(ref: RefObject<HTMLElement | null>, visible: boolean, reduced: boolean) {
  const previous = useRef<boolean | null>(null)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const initial = previous.current === null
    previous.current = visible
    element.hidden = false
    element.dataset.presence = visible ? 'entering' : 'exiting'
    const tokens = motionTokens(element)
    const hidden = { opacity: 0, transform: reduced ? 'none' : 'translateX(12px) scale(.98)' }
    const shown = { opacity: 1, transform: 'none' }
    const finish = () => { element.hidden = !visible; element.dataset.presence = visible ? 'present' : 'absent' }
    if ((initial && !visible) || reduced) { finish(); return }
    return animateVisual(element, visible ? [hidden, shown] : [shown, hidden], visible ? tokens.standard : tokens.fast,
      visible ? tokens.enter : tokens.exit, finish)
  }, [ref, visible, reduced])
}

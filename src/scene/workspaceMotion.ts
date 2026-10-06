import { animateVisual, motionTokens } from './motion'
import { planMotion } from './motionPlan'
import type { SurfacePosition } from './motionPlan'

interface Snapshot extends SurfacePosition { rect: DOMRect; visual: HTMLElement }
/** Freeze paint, not React workflows. Copies have no effects, handlers, IDs or focus. */
export function inertVisual(source: HTMLElement) {
  const copy = source.cloneNode(true) as HTMLElement
  copy.querySelectorAll('.motion-old-content').forEach((node) => node.remove())
  copy.inert = true; copy.setAttribute('aria-hidden', 'true'); copy.style.pointerEvents = 'none'
  for (const element of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
    for (const attribute of [...element.attributes]) {
      if (attribute.name === 'id' || attribute.name.startsWith('aria-') || attribute.name.startsWith('data-') || attribute.name.startsWith('on')) element.removeAttribute(attribute.name)
    }
    if (element.matches('button,input,select,textarea,fieldset')) element.setAttribute('disabled', '')
    element.setAttribute('tabindex', '-1')
  }
  copy.setAttribute('aria-hidden', 'true'); copy.inert = true
  return copy
}

/** Three authored tool surfaces only: frozen exits, keyed identity and local FLIP. */
export function createWorkspaceMotion(root: HTMLElement) {
  let snapshots: Snapshot[] = []
  const running = new Map<HTMLElement, () => void>()
  const overlays = new Set<HTMLElement>()
  function animate(node: HTMLElement, frames: Keyframe[], duration: number, easing: string, remove = false, delay = 0) {
    running.get(node)?.(); running.delete(node)
    const cancel = animateVisual(node, frames, duration, easing, () => {
      running.delete(node)
      if (remove) { node.remove(); overlays.delete(node) }
    }, delay)
    running.set(node, cancel)
  }
  function reconcile(reduced: boolean) {
    const tokens = motionTokens(root), rootRect = root.getBoundingClientRect()
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-motion-tool]')]
    const after = nodes.map((node) => ({ tool: node.dataset.motionTool!, slot: node.dataset.workspaceSlot! })) as SurfacePosition[]
    const plan = planMotion(snapshots, after)
    if (reduced) {
      running.forEach((cancel) => cancel()); running.clear()
      overlays.forEach((node) => node.remove()); overlays.clear()
    }
    const destinations = nodes.map((node, index) => {
      const previous = snapshots.find((item) => item.tool === after[index].tool)
      const moving = previous && previous.slot !== after[index].slot
      if (moving) { running.get(node)?.(); running.delete(node) }
      return { ...after[index], rect: previous && !moving && running.has(node) ? previous.rect : node.getBoundingClientRect(), visual: inertVisual(node) }
    })
    for (const old of plan.exits) {
      if (reduced) continue
      const saved = snapshots.find((item) => item.tool === old.tool)!
      const copy = saved.visual
      copy.classList.add('motion-exit'); copy.dataset.motionExit = old.tool
      Object.assign(copy.style, { position: 'absolute', left: `${saved.rect.left - rootRect.left}px`, top: `${saved.rect.top - rootRect.top}px`,
        width: `${saved.rect.width}px`, height: `${saved.rect.height}px`, margin: '0', gridArea: 'auto', zIndex: '3' })
      root.append(copy); overlays.add(copy)
      animate(copy, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(10px) scale(.98)' }], tokens.fast, tokens.exit, true)
    }
    for (const node of nodes) {
      const tool = node.dataset.motionTool!, move = plan.moves.find((item) => item.tool === tool)
      const enter = plan.enters.find((item) => item.tool === tool)
      const rect = destinations.find((item) => item.tool === tool)!.rect
      if (!reduced && move) {
        const old = snapshots.find((item) => item.tool === tool)!
        if (rect.width && rect.height && old.rect.width && old.rect.height) {
          animate(node, [{ transform: `translate(${old.rect.left - rect.left}px, ${old.rect.top - rect.top}px) scale(${old.rect.width / rect.width}, ${old.rect.height / rect.height})` },
            { transform: 'none' }], tokens.slow, tokens.move)
        }
        if (move.changesView) {
          const content = node.querySelector<HTMLElement>('.bubble-content')!
          const outgoing = old.visual.querySelector<HTMLElement>('.bubble-content')!
          const copy = inertVisual(outgoing)
          copy.classList.add('motion-old-content')
          copy.style.top = `${content.offsetTop}px`
          node.append(copy); overlays.add(copy)
          animate(copy, [{ opacity: 1 }, { opacity: 0 }], tokens.fast, tokens.exit, true)
          animate(content, [{ opacity: 0 }, { opacity: 1 }], tokens.standard, tokens.enter)
        }
      } else if (!reduced && enter) {
        animate(node, [{ opacity: 0, transform: `translateY(${enter.slot === 'primary' ? 10 : 7}px) scale(.98)` }, { opacity: 1, transform: 'none' }],
          tokens.standard, tokens.enter, false, enter.replacement ? tokens.fast : 0)
      }
    }
    snapshots = destinations
  }
  return { reconcile, dispose() {
    running.forEach((cancel) => cancel()); running.clear()
    overlays.forEach((node) => node.remove()); overlays.clear(); snapshots = []
  } }
}

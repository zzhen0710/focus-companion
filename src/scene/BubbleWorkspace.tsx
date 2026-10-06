import { useLayoutEffect, useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { UtilityTool } from '../experience/utilityState'
import { slots } from './workspace'
import type { Slot, Workspace, WorkspaceAction } from './workspace'
import { toolLabels } from './scenePresentation'
import { animateVisual, motionTokens, useReducedMotion } from './motion'
import { createWorkspaceMotion } from './workspaceMotion'
import { dropDrag, updateDrag } from './slotDrag'
import type { SlotDrag } from './slotDrag'
import { captureDragGhost, ghostPosition, paintDragGhost } from './dragGhost'
import type { DragGhostSnapshot } from './dragGhost'

const slotLabels = { primary: 'Primary', auxiliaryA: 'Aux A', auxiliaryB: 'Aux B' }
export default function BubbleWorkspace({ workspace, primary, compact, error, onAction, onRetry }: {
  workspace: Workspace; primary: ReactNode; compact(tool: UtilityTool): ReactNode; error: string | null
  onAction(action: WorkspaceAction): void; onRetry(): void
}) {
  const root = useRef<HTMLDivElement>(null), ghost = useRef<HTMLDivElement>(null)
  const motion = useRef<ReturnType<typeof createWorkspaceMotion> | null>(null)
  const drag = useRef<SlotDrag | null>(null), frame = useRef<number | null>(null)
  const dragVisual = useRef<DragGhostSnapshot | null>(null)
  const ghostExit = useRef<(() => void) | null>(null)
  const reduced = useReducedMotion()
  useLayoutEffect(() => {
    motion.current = createWorkspaceMotion(root.current!)
    return () => { motion.current?.dispose(); motion.current = null }
  }, [])
  function clearDrag() {
    const active = drag.current !== null
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null; drag.current = null; dragVisual.current = null
    root.current?.removeAttribute('data-dragging'); root.current?.removeAttribute('data-drag-target')
    const node = ghost.current
    if (active && node && !node.hidden) {
      const tokens = motionTokens(node)
      ghostExit.current?.()
      ghostExit.current = animateVisual(node, [{ opacity: .8 }, { opacity: 0 }], reduced ? 0 : tokens.fast, tokens.exit, () => { node.hidden = true })
    }
  }
  useLayoutEffect(() => {
    motion.current?.reconcile(reduced)
    // A closure/route change invalidates an in-flight gesture immediately.
    if (drag.current && (!workspace.expanded || workspace.slots[drag.current.from] !== drag.current.tool)) clearDrag()
  })
  useLayoutEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    ghostExit.current?.()
  }, [])
  function targetAt(x: number, y: number) {
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-workspace-slot]')
    const slot = target?.dataset.workspaceSlot as Slot | undefined
    return target && root.current?.contains(target) && slot && slots.includes(slot) ? slot : null
  }
  function start(event: PointerEvent<HTMLButtonElement>, from: Slot) {
    if (event.button !== 0 || drag.current) return
    const source = event.currentTarget.closest<HTMLElement>('[data-functional-tool]')
    if (!source || !ghost.current) return
    ghostExit.current?.(); ghostExit.current = null
    if (ghost.current) ghost.current.hidden = true
    drag.current = { from, tool: workspace.slots[from]!, x: event.clientX, y: event.clientY, moved: false, target: null }
    dragVisual.current = captureDragGhost(source, drag.current.tool, event.clientX, event.clientY)
    paintDragGhost(ghost.current, dragVisual.current)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return
    const x = event.clientX, y = event.clientY
    // Pointer position never enters React/App state. At most one paint per frame.
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      if (!drag.current || !dragVisual.current || !root.current || !ghost.current) return
      const current = updateDrag(drag.current, x, y, targetAt(x, y), workspace)
      drag.current = current
      if (!current.moved) return
      const node = ghost.current
      if (node.hidden) {
        ghostExit.current?.(); node.hidden = false
      }
      root.current.dataset.dragging = current.from
      if (current.target) root.current.dataset.dragTarget = current.target
      else root.current.removeAttribute('data-drag-target')
      const rect = root.current.getBoundingClientRect()
      const position = ghostPosition(dragVisual.current, x, y, rect)
      node.style.transform = `translate(${position.x}px, ${position.y}px)`
    })
  }
  function end(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current && updateDrag(drag.current, event.clientX, event.clientY, targetAt(event.clientX, event.clientY), workspace)
    const action = current && dropDrag(current, workspace)
    clearDrag()
    if (action) onAction(action)
  }
  const opened = workspace.expanded ? slots.flatMap((slot) => workspace.slots[slot] ? [{ slot, tool: workspace.slots[slot]! }] : []) : []
  return <div ref={root} className="bubble-workspace" aria-label="Tool workspace" data-reduced-motion={reduced}
    onKeyDown={(event) => { if (event.key === 'Escape' && drag.current) { clearDrag(); event.preventDefault(); event.stopPropagation() } }}>
    {opened.map(({ tool, slot }) => <section key={tool} className={`workspace-slot ${slot} functional-bubble scene-glass ${slot === 'primary' ? 'primary-view' : 'compact-view'}`}
      data-workspace-slot={slot} data-motion-tool={tool} data-functional-tool={tool} data-view={slot === 'primary' ? 'primary' : 'compact'} aria-labelledby={`bubble-heading-${tool}`}
      onPointerDown={() => onAction({ type: 'touch', tool })} onFocusCapture={() => onAction({ type: 'touch', tool })}>
      <header className="bubble-header"><h1 id={`bubble-heading-${tool}`} tabIndex={-1} title={toolLabels[tool]} data-tool-heading={tool}>{toolLabels[tool]}</h1>
        <div className="bubble-actions">
          <button className="slot-grip" type="button" aria-label={`Drag ${toolLabels[tool]} between slots`} title="Drag between slots"
            onPointerDown={(event) => start(event, slot)} onPointerMove={move} onPointerUp={end}
            onLostPointerCapture={clearDrag} onPointerCancel={clearDrag}>
            <span aria-hidden="true">⠿</span></button>
          <details className="slot-menu"><summary aria-label={`Arrange ${toolLabels[tool]}`}>↔</summary><div>
            {slots.filter((target) => target !== slot).map((target) => <button key={target} type="button"
              disabled={slot === 'primary' && !workspace.slots[target]}
              onClick={(event) => { event.currentTarget.closest('details')?.removeAttribute('open'); onAction({ type: 'swap', from: slot, to: target }) }}>
              {target === 'primary' ? 'Promote to Primary' : `Move to ${slotLabels[target]}`}</button>)}
          </div></details>
          <button type="button" aria-label={`Close ${toolLabels[tool]}`} onClick={() => onAction({ type: 'close', tool })}>
            <span aria-hidden="true">×</span></button>
        </div>
      </header>
      <div className="bubble-content feature-content">
        {error && slot === 'primary' ? <div className="scene-local-error" role="status"><p>{error}</p><button data-retry onClick={onRetry}>Retry saving / loading</button></div> : null}
        {slot === 'primary' ? error ? null : primary : compact(tool)}
      </div>
    </section>)}
    {workspace.expanded && slots.filter((slot) => !workspace.slots[slot]).map((slot) => <div key={slot} className={`workspace-slot ${slot} empty-slot`} data-workspace-slot={slot} aria-hidden="true" />)}
    <div ref={ghost} className="drag-ghost scene-glass" data-drag-ghost hidden inert aria-hidden="true">
      <div className="drag-ghost-heading"><strong /><span data-ghost-mode /></div>
      <div className="drag-ghost-summary"><p data-ghost-row /><p data-ghost-row /></div>
    </div>
  </div>
}

/// <reference types="node" />
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { planMotion } from './motionPlan'
import { animateVisual } from './motion'
import { createWorkspaceMotion, inertVisual } from './workspaceMotion'
import BubbleWorkspace from './BubbleWorkspace'
import ToolDrawer from './ToolDrawer'
import CompanionMessageStrip from './CompanionMessageStrip'
import { emptyWorkspace, transitionWorkspace } from './workspace'
import { dropDrag, updateDrag } from './slotDrag'
import type { SlotDrag } from './slotDrag'
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('./MainScene.css', import.meta.url), 'utf8')

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
function workspace() {
  let state = emptyWorkspace()
  for (const tool of ['focus', 'tasks', 'history'] as const) state = transitionWorkspace(state, { type: 'activate', tool })
  return state
}
const gesture = (): SlotDrag => ({ from: 'auxiliaryA', tool: 'tasks', x: 0, y: 0, moved: false, target: null })

describe('baseline Scene motion contracts', () => {
  it('preserves identity on Primary/Aux and Aux/Aux moves, crossfading only density changes', () => {
    const before = [{ tool: 'focus' as const, slot: 'primary' as const }, { tool: 'tasks' as const, slot: 'auxiliaryA' as const }, { tool: 'history' as const, slot: 'auxiliaryB' as const }]
    const promoted = planMotion(before, [{ tool: 'tasks', slot: 'primary' }, { tool: 'focus', slot: 'auxiliaryA' }, before[2]])
    expect(promoted.enters).toEqual([]); expect(promoted.exits).toEqual([])
    expect(promoted.moves.map((item) => [item.tool, item.changesView])).toEqual([['tasks', true], ['focus', true]])
    expect(planMotion(before, [before[0], { tool: 'tasks', slot: 'auxiliaryB' }, { tool: 'history', slot: 'auxiliaryA' }]).moves.every((item) => !item.changesView)).toBe(true)
  })
  it('separates a closed functional assignment from its frozen exit, and sequences replacement', () => {
    const before = [{ tool: 'focus' as const, slot: 'primary' as const }, { tool: 'tasks' as const, slot: 'auxiliaryA' as const }]
    const plan = planMotion(before, [before[0], { tool: 'review', slot: 'auxiliaryA' }])
    expect(plan.exits).toEqual([before[1]])
    expect(plan.enters).toEqual([{ tool: 'review', slot: 'auxiliaryA', replacement: true }])
    const closed = transitionWorkspace(workspace(), { type: 'close', tool: 'tasks' })
    expect(Object.values(closed.slots)).not.toContain('tasks')
  })
  it('maps the first Aux to lower-right and the next to lower-left without changing logical order', () => {
    const state = workspace()
    expect(state.slots.auxiliaryA).toBe('tasks'); expect(state.slots.auxiliaryB).toBe('history')
    expect(css).toMatch(/\.workspace-slot\.auxiliaryA\s*\{\s*grid-area: 2 \/ 2 \/ 3 \/ 3/)
    expect(css).toMatch(/\.workspace-slot\.auxiliaryB\s*\{\s*grid-area: 2 \/ 1 \/ 3 \/ 2/)
  })
  it('exposes an inert ghost silhouette containing no functional controls', () => {
    const html = renderToStaticMarkup(<BubbleWorkspace workspace={workspace()} primary={<input aria-label="real editor" />} compact={() => <p>Compact</p>} error={null} onAction={() => {}} onRetry={() => {}} />)
    const ghost = html.slice(html.indexOf('class="drag-ghost'), html.indexOf('class="drag-ghost') + 200)
    expect(ghost).toContain('data-drag-ghost="true" hidden="" inert="" aria-hidden="true"')
    expect(ghost).not.toMatch(/<input|<button|<select|<textarea/)
    expect(html).toContain('data-reduced-motion="false"')
  })
  it('exposes valid target/drop actions; outside, source, stale and cancelled gestures do not swap', () => {
    const state = workspace(), moved = updateDrag(gesture(), 20, 20, 'primary', state)
    expect(moved.moved).toBe(true); expect(moved.target).toBe('primary')
    expect(dropDrag(moved, state)).toEqual({ type: 'swap', from: 'auxiliaryA', to: 'primary' })
    expect(dropDrag(updateDrag(gesture(), 20, 20, null, state), state)).toBeNull()
    expect(dropDrag(updateDrag(gesture(), 20, 20, 'auxiliaryA', state), state)).toBeNull()
    expect(dropDrag(moved, transitionWorkspace(state, { type: 'close', tool: 'tasks' }))).toBeNull()
    expect(dropDrag(gesture(), state)).toBeNull()
    expect(state.slots).toEqual(workspace().slots)
  })
  it('rejects Primary drops into an empty Aux, and allows Aux-to-empty-Aux movement', () => {
    const state = transitionWorkspace(workspace(), { type: 'close', tool: 'history' })
    expect(updateDrag({ ...gesture(), from: 'primary', tool: 'focus' }, 20, 20, 'auxiliaryB', state).target).toBeNull()
    expect(dropDrag(updateDrag(gesture(), 20, 20, 'auxiliaryB', state), state)).toEqual({ type: 'swap', from: 'auxiliaryA', to: 'auxiliaryB' })
  })
  it('keeps drawer/message semantics independent and retains stable launcher DOM order when hidden', () => {
    const drawer = renderToStaticMarkup(<ToolDrawer workspace={emptyWorkspace()} error={null} pendingReview={null} onAction={() => {}} onRetry={() => {}} />)
    expect(drawer).toContain('aria-label="Show tools"')
    expect(drawer).toContain('inert="" aria-hidden="true" data-visible="false"')
    expect([...drawer.matchAll(/data-launcher="([^"]+)"/g)].map((match) => match[1])).toEqual(['focus', 'tasks', 'review', 'history', 'insights'])
    const message = renderToStaticMarkup(<CompanionMessageStrip message={{ key: 'neutralAmbient', text: 'Current' }} collapsed={false} onToggle={() => {}} />)
    expect(message).toContain('Hide companion message'); expect(message).not.toContain('data-launcher')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('--motion-standard: 0ms')
    expect(css).not.toMatch(/overflow(?:-y)?:\s*(?:auto|scroll)/)
  })
})

// Small DOM doubles test lifetime/safety, not browser geometry or animation pixels.
interface CloneableChild { cloneNode(): CloneableChild }
function fakeElement(tag = 'section', attributes: Record<string, string> = {}, children: CloneableChild[] = []) {
  const data = { ...attributes }
  const element = {
    style: {}, dataset: {} as Record<string, string>, inert: false, removed: false,
    classList: { add: vi.fn() },
    get attributes() { return Object.entries(data).map(([name, value]) => ({ name, value })) },
    setAttribute(name: string, value: string) { data[name] = value }, removeAttribute(name: string) { delete data[name] },
    matches(selector: string) { return selector.split(',').includes(tag) },
    querySelectorAll(selector: string) { return selector === '*' ? children : [] },
    cloneNode(): CloneableChild { return fakeElement(tag, data, children.map((child) => child.cloneNode())) },
    getBoundingClientRect() { return { left: 10, top: 20, width: 300, height: 200 } },
    remove() { element.removed = true },
    animate: vi.fn(() => ({ finished: new Promise<void>(() => {}), cancel: vi.fn() })),
  }
  return element
}
describe('visual presence safety and cleanup', () => {
  it('strips operational selectors/IDs, disables controls and hides frozen paint from accessibility', () => {
    const copy = inertVisual(fakeElement('section', { id: 'tool', 'data-functional-tool': 'tasks', 'aria-live': 'polite' }, [fakeElement('input', { id: 'draft' })]) as unknown as HTMLElement)
    expect(copy.inert).toBe(true)
    const attributes = [...copy.attributes].map((attribute) => [attribute.name, attribute.value])
    expect(attributes).toContainEqual(['aria-hidden', 'true']); expect(attributes).not.toContainEqual(['id', 'tool'])
    expect(attributes.some(([name]) => name.startsWith('data-'))).toBe(false)
    expect([...copy.querySelectorAll('*')[0].attributes].map((attribute) => attribute.name)).toContain('disabled')
  })
  it('retains an inert visual exit after live removal and unmounts via fallback if completion is missed', () => {
    vi.useFakeTimers()
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (name: string) => name.startsWith('--motion-') ? '120ms' : 'ease' }))
    const card = fakeElement(); card.dataset = { motionTool: 'focus', workspaceSlot: 'primary' }
    let live = [card]
    const overlays: ReturnType<typeof fakeElement>[] = []
    const root = { getBoundingClientRect: card.getBoundingClientRect, querySelectorAll: () => live, append: (copy: ReturnType<typeof fakeElement>) => overlays.push(copy) }
    const motion = createWorkspaceMotion(root as unknown as HTMLElement)
    motion.reconcile(false); live = []; motion.reconcile(false)
    expect(overlays).toHaveLength(1); expect(overlays[0].dataset.motionExit).toBe('focus')
    expect(overlays[0].inert).toBe(true); expect(overlays[0].removed).toBe(false)
    vi.runAllTimers()
    expect(overlays[0].removed).toBe(true)
    motion.dispose()
  })
  it('cleans retained exits immediately in reduced motion', () => {
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '0ms' }))
    const card = fakeElement(); card.dataset = { motionTool: 'focus', workspaceSlot: 'primary' }
    let live = [card]
    const append = vi.fn()
    const root = { getBoundingClientRect: card.getBoundingClientRect, querySelectorAll: () => live, append }
    const motion = createWorkspaceMotion(root as unknown as HTMLElement)
    motion.reconcile(true); live = []; motion.reconcile(true)
    expect(append).not.toHaveBeenCalled(); motion.dispose()
  })
  it('cancellation clears fallback and prevents late visual callbacks', () => {
    vi.useFakeTimers()
    const node = fakeElement(), done = vi.fn()
    const cancel = animateVisual(node as unknown as HTMLElement, [{ opacity: 1 }, { opacity: 0 }], 120, 'ease', done)
    cancel(); vi.runAllTimers()
    expect(done).not.toHaveBeenCalled()
  })
  it('cleans visual presence on animation completion without waiting for fallback', async () => {
    vi.useFakeTimers()
    let complete!: () => void
    const done = vi.fn(), cancel = vi.fn()
    const node = { animate: () => ({ finished: new Promise<void>((resolve) => { complete = resolve }), cancel }) }
    animateVisual(node as unknown as HTMLElement, [{ opacity: 1 }, { opacity: 0 }], 120, 'ease', done)
    complete(); await Promise.resolve()
    expect(done).toHaveBeenCalledOnce(); expect(cancel).toHaveBeenCalledOnce()
    vi.runAllTimers(); expect(done).toHaveBeenCalledOnce()
  })
})

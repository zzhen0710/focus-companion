import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { captureDragGhost, ghostPosition, paintDragGhost } from './dragGhost'
import BubbleWorkspace from './BubbleWorkspace'
import { emptyWorkspace, transitionWorkspace } from './workspace'
import { dropDrag, updateDrag } from './slotDrag'

afterEach(() => vi.unstubAllGlobals())
function source(mode: 'primary' | 'compact', width: number, height: number, rows: Record<string, string[]> = {}) {
  vi.stubGlobal('getComputedStyle', () => ({ borderRadius: '24px', background: 'rgb(35, 29, 45)', border: '1px solid rgb(143, 124, 155)', backdropFilter: 'blur(8px)' }))
  return { dataset: { view: mode }, getBoundingClientRect: () => ({ left: 100, top: 80, width, height }),
    querySelectorAll: (selector: string) => (rows[selector] ?? []).map((textContent) => ({ textContent })),
    querySelector: (selector: string) => rows[selector]?.length ? { textContent: rows[selector][0] } : null,
  } as unknown as HTMLElement
}
describe('full-footprint drag ghost', () => {
  it('captures rendered Primary and Compact dimensions independently, with source silhouette/material', () => {
    const primary = captureDragGhost(source('primary', 420, 340), 'history', 480, 100)
    const compact = captureDragGhost(source('compact', 202, 190), 'history', 280, 100)
    expect(primary).toMatchObject({ width: 420, height: 340, mode: 'primary', radius: '24px', blur: 'blur(8px)' })
    expect(compact).toMatchObject({ width: 202, height: 190, mode: 'compact' })
    expect(primary.background).toBe(compact.background); expect(primary.border).toBe(compact.border)
    expect(primary.title).toBe('History')
  })
  it('preserves a top-right grab offset as the pointer and workspace origin change', () => {
    const snapshot = captureDragGhost(source('primary', 420, 340), 'tasks', 480, 100)
    expect(snapshot).toMatchObject({ grabX: 380, grabY: 20 })
    expect(ghostPosition(snapshot, 480, 100, { left: 100, top: 80 })).toEqual({ x: 0, y: 0 })
    expect(ghostPosition(snapshot, 530, 170, { left: 120, top: 90 })).toEqual({ x: 30, y: 60 })
    expect(snapshot.grabX).toBe(380); expect(snapshot.grabY).toBe(20)
  })
  it('reads only existing rendered summary text and bounds it to two distinct rows', () => {
    const snapshot = captureDragGhost(source('compact', 202, 190, { '.compact-tool p': [' Task activity ', 'Task activity'], '.compact-tool time': ['10/6/2026'] }), 'history', 150, 100)
    expect(snapshot.rows).toEqual(['Task activity', '10/6/2026'])
    expect(captureDragGhost(source('compact', 202, 190, { '.compact-tool p': ['3 open · 1 overdue', 'Read CSAPP', 'extra'] }), 'tasks', 150, 100).rows)
      .toEqual(['3 open · 1 overdue', 'Read CSAPP'])
  })
  it('uses a timer/status row and captured target without invoking a timer or service', () => {
    const snapshot = captureDragGhost(source('primary', 420, 340, { output: ['24:12'], '.timer-status': ['Running'], '.one-line': ['Focus target: Read CSAPP'] }), 'focus', 150, 100)
    expect(snapshot.rows).toEqual(['24:12 · Running', 'Focus target: Read CSAPP'])
  })
  it('paints dimensions and text into a simple ghost without cloning nodes or injecting markup', () => {
    const snapshot = captureDragGhost(source('compact', 202, 190, { '.compact-tool p': ['<input autofocus>'] }), 'review', 150, 100)
    const heading = { textContent: '' }, mode = { textContent: '' }, rows = [{ textContent: '' }, { textContent: '' }]
    const node = { style: {}, dataset: {}, querySelector: (selector: string) => selector === 'strong' ? heading : mode,
      querySelectorAll: () => rows }
    paintDragGhost(node as unknown as HTMLElement, snapshot)
    expect(node.style).toMatchObject({ width: '202px', height: '190px', borderRadius: '24px' })
    expect(node.dataset).toEqual({ ghostView: 'compact' })
    expect(heading.textContent).toBe('Review'); expect(mode.textContent).toBe('Compact')
    expect(rows.map((row) => row.textContent)).toEqual(['<input autofocus>', ''])
  })
  it('renders heading, presentation identity and summary rows rather than a title chip, with no interactive tree', () => {
    const state = transitionWorkspace(emptyWorkspace(), { type: 'activate', tool: 'tasks' })
    const html = renderToStaticMarkup(<BubbleWorkspace workspace={state} primary={<input id="real-draft" />} compact={() => null} error={null} onAction={() => {}} onRetry={() => {}} />)
    const ghost = html.slice(html.indexOf('class="drag-ghost'))
    expect(ghost).toContain('data-drag-ghost="true" hidden="" inert="" aria-hidden="true"')
    expect(ghost).toContain('drag-ghost-heading'); expect(ghost).toContain('data-ghost-mode')
    expect(ghost.match(/data-ghost-row=/g)).toHaveLength(2)
    expect(ghost).not.toMatch(/<input|<button|<select|<textarea|tabindex=|\sid=/)
  })
  it('leaves assignments untouched during drag/cancel and retains the existing drop swap', () => {
    let state = transitionWorkspace(emptyWorkspace(), { type: 'activate', tool: 'tasks' })
    state = transitionWorkspace(state, { type: 'activate', tool: 'history' })
    const before = structuredClone(state)
    const initial = { from: 'auxiliaryA' as const, tool: 'history' as const, x: 480, y: 100, moved: false, target: null }
    const snapshot = captureDragGhost(source('compact', 202, 190), 'history', 480, 100)
    ghostPosition(snapshot, 520, 160, { left: 100, top: 80 })
    const gesture = updateDrag(initial, 520, 160, 'primary', state)
    expect(state).toEqual(before)
    expect(dropDrag(updateDrag(initial, 520, 160, null, state), state)).toBeNull()
    expect(state).toEqual(before)
    const action = dropDrag(gesture, state)!
    expect(action).toEqual({ type: 'swap', from: 'auxiliaryA', to: 'primary' })
    expect(transitionWorkspace(state, action).slots).toEqual({ primary: 'history', auxiliaryA: 'tasks', auxiliaryB: null })
  })
})

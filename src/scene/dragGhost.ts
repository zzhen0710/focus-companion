import type { UtilityTool } from '../experience/utilityState'
import { toolLabels } from './scenePresentation'

export interface DragGhostSnapshot {
  width: number; height: number; grabX: number; grabY: number
  mode: 'primary' | 'compact'; title: string; rows: string[]
  radius: string; background: string; border: string; blur: string
}
const summaries: Record<UtilityTool, string[]> = {
  focus: ['output', '.timer-status', '.one-line', '.compact-tool p'],
  tasks: ['.compact-tool p', '.task-card h2'],
  review: ['.compact-tool p', '.review-panel .one-line', '.review-panel [role="status"]'],
  history: ['.history-item h2', '.history-item time', '.compact-tool p', '.compact-tool time'],
  insights: ['.bubble-subviews [aria-pressed="true"]', '.insights-metrics > div', '.compact-tool dl'],
}
/** Read existing rendered presentation once. No workflow cloning or new data queries. */
export function captureDragGhost(source: HTMLElement, tool: UtilityTool, x: number, y: number): DragGhostSnapshot {
  const rect = source.getBoundingClientRect(), style = getComputedStyle(source)
  const rows = summaries[tool].flatMap((selector) => [...source.querySelectorAll<HTMLElement>(selector)]
    .map((node) => node.textContent?.trim().replace(/\s+/g, ' ') ?? '')).filter(Boolean)
  if (tool === 'focus') {
    const text = (selector: string) => source.querySelector(selector)?.textContent?.trim() ?? ''
    rows.splice(0, rows.length, [text('output'), text('.timer-status') || text('.compact-tool p')].filter(Boolean).join(' · '), text('.one-line'))
  }
  return {
    width: rect.width, height: rect.height, grabX: x - rect.left, grabY: y - rect.top,
    mode: source.dataset.view === 'primary' ? 'primary' : 'compact', title: toolLabels[tool],
    rows: [...new Set(rows.filter(Boolean))].slice(0, 2), radius: style.borderRadius,
    background: style.background, border: style.border, blur: style.backdropFilter,
  }
}
export function ghostPosition(snapshot: DragGhostSnapshot, x: number, y: number, workspace: { left: number; top: number }) {
  return { x: x - snapshot.grabX - workspace.left, y: y - snapshot.grabY - workspace.top }
}
export function paintDragGhost(node: HTMLElement, snapshot: DragGhostSnapshot) {
  Object.assign(node.style, { width: `${snapshot.width}px`, height: `${snapshot.height}px`,
    borderRadius: snapshot.radius, background: snapshot.background, border: snapshot.border, backdropFilter: snapshot.blur })
  node.dataset.ghostView = snapshot.mode
  node.querySelector('strong')!.textContent = snapshot.title
  node.querySelector('[data-ghost-mode]')!.textContent = snapshot.mode === 'primary' ? 'Primary' : 'Compact'
  node.querySelectorAll('[data-ghost-row]').forEach((row, index) => { row.textContent = snapshot.rows[index] ?? '' })
}

import type { UtilityTool } from '../experience/utilityState'

export const slots = ['primary', 'auxiliaryA', 'auxiliaryB'] as const
export type Slot = typeof slots[number]
export interface Workspace {
  expanded: boolean
  slots: Record<Slot, UtilityTool | null>
  opened: Partial<Record<UtilityTool, number>>
  active: Partial<Record<UtilityTool, number>>
  sequence: number
}
export type WorkspaceAction = { type: 'reveal' } | { type: 'collapse' }
  | { type: 'activate' | 'close' | 'promote' | 'touch'; tool: UtilityTool }
  | { type: 'swap'; from: Slot; to: Slot }
export function emptyWorkspace(): Workspace {
  return { expanded: false, slots: { primary: null, auxiliaryA: null, auxiliaryB: null }, opened: {}, active: {}, sequence: 0 }
}
export function toolSlot(state: Workspace, tool: UtilityTool) { return slots.find((slot) => state.slots[slot] === tool) }
function mark(state: Workspace, tool: UtilityTool, opening = false): Workspace {
  const sequence = state.sequence + 1
  return { ...state, sequence, active: { ...state.active, [tool]: sequence },
    opened: opening ? { ...state.opened, [tool]: sequence } : state.opened }
}
function close(state: Workspace, tool: UtilityTool): Workspace {
  const slot = toolSlot(state, tool)
  if (!slot) return state
  const next = { ...state, slots: { ...state.slots, [slot]: null } }
  if (slot === 'primary') {
    const candidates = (['auxiliaryA', 'auxiliaryB'] as const).filter((s) => next.slots[s])
      .sort((a, b) => (state.active[next.slots[b]!] ?? 0) - (state.active[next.slots[a]!] ?? 0))
    const recent = candidates[0]
    if (recent) { next.slots.primary = next.slots[recent]; next.slots[recent] = null }
  }
  return next
}
/** Three authored slots only. No geometry, workflow operations or durable state. */
export function transitionWorkspace(state: Workspace, action: WorkspaceAction): Workspace {
  if (action.type === 'collapse') return state.expanded ? emptyWorkspace() : state
  if (action.type === 'reveal') return state.expanded ? state : { ...state, expanded: true }
  if (action.type === 'swap') {
    if (action.from === action.to || !state.slots[action.from]) return state
    // A working auxiliary must never remain beneath an empty primary.
    if (action.from === 'primary' && !state.slots[action.to]) return state
    const next = { ...state, slots: { ...state.slots, [action.to]: state.slots[action.from], [action.from]: state.slots[action.to] } }
    return mark(next, state.slots[action.from]!)
  }
  const slot = toolSlot(state, action.tool)
  if (action.type === 'touch') return slot ? mark(state, action.tool) : state
  if (action.type === 'close') return close(state, action.tool)
  if (action.type === 'promote') return slot && slot !== 'primary'
    ? transitionWorkspace(state, { type: 'swap', from: slot, to: 'primary' }) : state
  if (slot) return close(state, action.tool)
  const target = !state.slots.primary ? 'primary' : !state.slots.auxiliaryA ? 'auxiliaryA'
    : !state.slots.auxiliaryB ? 'auxiliaryB'
      : (state.opened[state.slots.auxiliaryA] ?? 0) <= (state.opened[state.slots.auxiliaryB] ?? 0) ? 'auxiliaryA' : 'auxiliaryB'
  return mark({ ...state, expanded: true, slots: { ...state.slots, [target]: action.tool } }, action.tool, true)
}
/** External routes select only the primary context, never replay old compositions. */
export function routeWorkspace(state: Workspace, tool: UtilityTool | null): Workspace {
  if (!tool) return emptyWorkspace()
  const slot = toolSlot(state, tool)
  if (slot === 'primary') return state
  if (slot) return transitionWorkspace(state, { type: 'promote', tool })
  return mark({ ...state, expanded: true, slots: { ...state.slots, primary: tool } }, tool, true)
}

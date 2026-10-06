import type { UtilityTool } from '../experience/utilityState'
import type { Slot, Workspace, WorkspaceAction } from './workspace'
export interface SlotDrag { from: Slot; tool: UtilityTool; x: number; y: number; moved: boolean; target: Slot | null }
export function dragTarget(drag: SlotDrag, slot: Slot | null, workspace: Workspace): Slot | null {
  if (workspace.slots[drag.from] !== drag.tool || !slot || slot === drag.from) return null
  return drag.from === 'primary' && !workspace.slots[slot] ? null : slot
}
export function updateDrag(drag: SlotDrag, x: number, y: number, slot: Slot | null, workspace: Workspace): SlotDrag {
  const moved = drag.moved || Math.hypot(x - drag.x, y - drag.y) > 6
  return { ...drag, moved, target: moved ? dragTarget(drag, slot, workspace) : null }
}
export function dropDrag(drag: SlotDrag, workspace: Workspace): WorkspaceAction | null {
  const target = drag.moved ? dragTarget(drag, drag.target, workspace) : null
  return target ? { type: 'swap', from: drag.from, to: target } : null
}

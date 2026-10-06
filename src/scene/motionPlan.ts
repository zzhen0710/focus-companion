import type { UtilityTool } from '../experience/utilityState'
import type { Slot } from './workspace'
export interface SurfacePosition { tool: UtilityTool; slot: Slot }
export function planMotion(before: SurfacePosition[], after: SurfacePosition[]) {
  const exits = before.filter((old) => !after.some((next) => next.tool === old.tool))
  return {
    exits,
    enters: after.filter((next) => !before.some((old) => old.tool === next.tool))
      .map((next) => ({ ...next, replacement: exits.some((old) => old.slot === next.slot) })),
    moves: after.flatMap((next) => {
      const old = before.find((item) => item.tool === next.tool)
      return old && old.slot !== next.slot ? [{ ...next, from: old.slot, changesView: (old.slot === 'primary') !== (next.slot === 'primary') }] : []
    }),
  }
}

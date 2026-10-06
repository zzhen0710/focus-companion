export const utilityTools = ['focus', 'tasks', 'review', 'history', 'insights'] as const
export type UtilityTool = typeof utilityTools[number]
export type UtilityState = { kind: 'immersive' } | { kind: 'utilityReady' } | { kind: 'activePanel'; tool: UtilityTool }
export type UtilityAction = { type: 'reveal' | 'collapse' | 'close' } | { type: 'activate'; tool: UtilityTool }

export function transitionUtility(state: UtilityState, action: UtilityAction): UtilityState {
  switch (action.type) {
    case 'reveal': return state.kind === 'immersive' ? { kind: 'utilityReady' } : state
    case 'collapse': return state.kind === 'immersive' ? state : { kind: 'immersive' }
    case 'close': return state.kind === 'activePanel' ? { kind: 'utilityReady' } : state
    case 'activate':
      if (state.kind === 'immersive' || !utilityTools.includes(action.tool)) return state
      return state.kind === 'activePanel' && state.tool === action.tool
        ? { kind: 'utilityReady' } : { kind: 'activePanel', tool: action.tool }
  }
}

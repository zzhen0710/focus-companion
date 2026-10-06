import { transitionUtility } from '../../experience/utilityState'
import type { UtilityAction, UtilityState } from '../../experience/utilityState'
export interface PrototypeState { utility: UtilityState; draft: string; confirmation: boolean; decisionMessage: string }
export function initialPrototypeState(): PrototypeState {
  return { utility: { kind: 'immersive' }, draft: '', confirmation: false, decisionMessage: '' }
}
export function changePresentation(state: PrototypeState, action: UtilityAction): PrototypeState {
  const utility = transitionUtility(state.utility, action)
  if (utility === state.utility) return state
  return { ...state, utility, confirmation: false, decisionMessage: '' }
}

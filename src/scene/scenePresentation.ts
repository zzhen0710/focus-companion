import type { Workspace } from './workspace'
import type { UtilityTool } from '../experience/utilityState'
import type { ExperienceContext } from '../experience/context'
import type { ExpressionIntent } from '../experience/rules'
import { ambientMessage, reactionMessage } from '../experience/messages'
export const toolLabels: Record<UtilityTool, string> = { focus: 'Focus', tasks: 'Tasks', review: 'Review', history: 'History', insights: 'Insights' }
export function sceneFocusTarget(state: Workspace, tool: UtilityTool | null): string {
  return !state.expanded ? '[data-handle]' : tool && Object.values(state.slots).includes(tool)
    ? `[data-tool-heading="${tool}"]` : tool ? `[data-launcher="${tool}"]` : '[data-handle]'
}
export function companionMessage(intent: ExpressionIntent, context: ExperienceContext, error: string | null, suppressed: boolean) {
  return error || suppressed ? null : reactionMessage(intent) ?? ambientMessage(intent, context)
}

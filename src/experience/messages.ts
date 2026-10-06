import type { ExperienceContext } from './context'
import type { ExpressionIntent } from './rules'

// Placeholder product copy for integration, not final Companion personality.
const copy = {
  neutralAmbient: 'One thing at a time.', pausedAmbient: 'Resume when you’re ready.', breakAmbient: 'A little room to rest.',
  reviewPending: 'A little work to revisit.', focusAcknowledgment: 'Focus session recorded.', taskAcknowledgment: 'Task completed.',
}
export type MessageKey = keyof typeof copy
function message(key: MessageKey) { return { key, text: copy[key] } }
export function reactionMessage(intent: ExpressionIntent) { return intent.primaryReaction ? message(intent.primaryReaction.kind) : null }
export function ambientMessage(intent: ExpressionIntent, context: ExperienceContext) {
  if (context.saved.status !== 'ready' || context.focus.status !== 'ready' || context.focus.value.error ||
    context.focus.value.pendingCompletion || context.focus.value.pendingReset || intent.presence === 'working' || intent.presence === 'unknown') return null
  if (intent.ambient) return message('reviewPending')
  return message(intent.presence === 'paused' ? 'pausedAmbient' : intent.presence === 'onBreak' ? 'breakAmbient' : 'neutralAmbient')
}

import type { ExperienceContext } from './context'

// Prototype tuning only; not final Companion personality or product policy.
export const PRIMARY_DISPLAY_MS = 3000
export const PRIMARY_COOLDOWN_MS = 10_000
export const EVENT_FRESHNESS_MS = 30_000
export type PrimaryIntent = { kind: 'focusAcknowledgment' | 'taskAcknowledgment'; factId: string; expiresAt: number }
export interface ExpressionIntent {
  presence: 'neutral' | 'working' | 'paused' | 'onBreak' | 'unknown'
  primary: PrimaryIntent | null
  ambient: { kind: 'reviewPending' } | null
}
export interface RuleMemory {
  initialized: boolean
  seen: readonly string[]
  lastPrimaryAt: number | null
  primary: PrimaryIntent | null
  reviewOffered: boolean
  reviewVisible: boolean
}
export interface Attention { visible: boolean; decisionActive: boolean; reviewOpen: boolean; blockingError: boolean }
export function initialRuleMemory(): RuleMemory {
  return { initialized: false, seen: [], lastPrimaryAt: null, primary: null, reviewOffered: false, reviewVisible: false }
}

export function evaluateExperience(context: ExperienceContext, attention: Attention, memory: RuleMemory) {
  const focus = context.focus.status === 'ready' ? context.focus.value : null
  const presence: ExpressionIntent['presence'] = !focus ? 'unknown' : focus.status === 'paused' ? 'paused'
    : focus.status === 'running' ? focus.mode === 'focus' ? 'working' : 'onBreak' : 'neutral'
  const healthy = context.saved.status === 'ready' && !!focus && !focus.error &&
    !focus.pendingCompletion && !focus.pendingReset && !attention.blockingError
  const saved = context.saved.status === 'ready' ? context.saved.value : null
  const candidates: { key: string; kind: PrimaryIntent['kind']; factId: string; occurredAt: number }[] = []
  if (saved?.lastFocus?.outcome === 'completed') candidates.push({ key: `focus:${saved.lastFocus.id}`,
    kind: 'focusAcknowledgment', factId: saved.lastFocus.id, occurredAt: saved.lastFocus.endedAt })
  if (saved?.lastTaskOutcome?.type === 'taskCompleted') candidates.push({ key: `task:${saved.lastTaskOutcome.id}`,
    kind: 'taskAcknowledgment', factId: saved.lastTaskOutcome.id, occurredAt: saved.lastTaskOutcome.occurredAt })
  const seen = new Set(memory.seen)
  const fresh = candidates.filter((item) => !seen.has(item.key) && context.now >= item.occurredAt &&
    context.now - item.occurredAt <= EVENT_FRESHNESS_MS)
  // Consume suppressed/losing/expired candidates rather than queueing them.
  candidates.forEach((item) => seen.add(item.key))
  const suppressed = !healthy || !attention.visible || attention.decisionActive || presence === 'working'
  let primary = !suppressed && memory.primary && context.now < memory.primary.expiresAt ? memory.primary : null
  let lastPrimaryAt = memory.lastPrimaryAt
  if (healthy && memory.initialized && !suppressed && !primary &&
    (lastPrimaryAt === null || context.now - lastPrimaryAt >= PRIMARY_COOLDOWN_MS) && fresh.length) {
    const winner = fresh[0] // Focus candidate precedes Task candidate: explicit priority.
    primary = { kind: winner.kind, factId: winner.factId, expiresAt: context.now + PRIMARY_DISPLAY_MS }
    lastPrimaryAt = context.now
  }
  const pendingReview = !!saved && saved.review.remainingCount > 0
  const offerReview = memory.initialized && !suppressed && !attention.reviewOpen && pendingReview && !memory.reviewOffered
  const reviewVisible = offerReview || (memory.reviewVisible && !suppressed && !attention.reviewOpen && pendingReview)
  const ambient: ExpressionIntent['ambient'] = reviewVisible ? { kind: 'reviewPending' } : null
  return { intent: { presence, primary, ambient } satisfies ExpressionIntent,
    nextMemory: { initialized: healthy, seen: [...seen], primary, lastPrimaryAt,
      reviewOffered: memory.reviewOffered || offerReview, reviewVisible } satisfies RuleMemory }
}

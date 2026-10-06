import { describe, expect, it } from 'vitest'
import { ambientMessage, reactionMessage } from './messages'
import { createPrototypeRuntime } from '../prototypes/main-scene/fixtures'
describe('small provisional expression vocabulary', () => {
  it('uses semantic keys for ambient states and Review rather than generated copy', () => {
    const { context } = createPrototypeRuntime().getSnapshot()
    const intent = { presence: 'neutral' as const, primaryReaction: null, ambient: null }
    expect(ambientMessage(intent, context)?.key).toBe('neutralAmbient')
    expect(ambientMessage({ ...intent, presence: 'paused' }, context)?.key).toBe('pausedAmbient')
    expect(ambientMessage({ ...intent, presence: 'onBreak' }, context)?.key).toBe('breakAmbient')
    expect(ambientMessage({ ...intent, ambient: { kind: 'reviewPending' } }, context)?.key).toBe('reviewPending')
    expect(ambientMessage({ ...intent, presence: 'working' }, context)).toBeNull()
    expect(ambientMessage(intent, { ...context, saved: { status: 'unavailable', error: 'Failed' } })).toBeNull()
  })
  it('maps only actual reaction intent to explicit Focus/Task nouns', () => {
    const intent = { presence: 'neutral' as const, primaryReaction: null, ambient: null }
    expect(reactionMessage(intent)).toBeNull()
    expect(reactionMessage({ ...intent, primaryReaction: { kind: 'focusAcknowledgment', factId: 'f', expiresAt: 1 } })?.text).toBe('Focus session recorded.')
    expect(reactionMessage({ ...intent, primaryReaction: { kind: 'taskAcknowledgment', factId: 't', expiresAt: 1 } })?.text).toBe('Task completed.')
  })
})

import { describe, expect, it } from 'vitest'
import { companionMessage, sceneFocusTarget } from './scenePresentation'
import { emptyWorkspace, transitionWorkspace } from './workspace'
import { createPrototypeRuntime } from '../prototypes/main-scene/fixtures'
describe('workspace focus and independent expression presentation', () => {
  it('chooses a moved tool heading, closed launcher, or collapsed Handle without animation timing', () => {
    const state = transitionWorkspace(emptyWorkspace(), { type: 'activate', tool: 'tasks' })
    expect(sceneFocusTarget(state, 'tasks')).toBe('[data-tool-heading="tasks"]')
    expect(sceneFocusTarget(state, 'history')).toBe('[data-launcher="history"]')
    expect(sceneFocusTarget(emptyWorkspace(), null)).toBe('[data-handle]')
  })
  it('suppresses expression for operational errors/decisions/constrained views, not tool visibility', () => {
    const { intent, context } = createPrototypeRuntime().getSnapshot()
    expect(companionMessage(intent, context, null, false)?.key).toBe('neutralAmbient')
    expect(companionMessage(intent, context, 'Error', false)).toBeNull()
    expect(companionMessage(intent, context, null, true)).toBeNull()
  })
})

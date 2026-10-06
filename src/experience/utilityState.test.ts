import { describe, expect, it } from 'vitest'
import { transitionUtility, utilityTools } from './utilityState'
import type { UtilityState, UtilityTool } from './utilityState'
describe('one active utility', () => {
  it('reveals launchers, opens, replaces, toggles and closes panels', () => {
    let state: UtilityState = { kind: 'immersive' }
    state = transitionUtility(state, { type: 'reveal' }); expect(state).toEqual({ kind: 'utilityReady' })
    state = transitionUtility(state, { type: 'activate', tool: 'tasks' }); expect(state).toEqual({ kind: 'activePanel', tool: 'tasks' })
    state = transitionUtility(state, { type: 'activate', tool: 'insights' }); expect(state).toEqual({ kind: 'activePanel', tool: 'insights' })
    state = transitionUtility(state, { type: 'activate', tool: 'insights' }); expect(state).toEqual({ kind: 'utilityReady' })
    state = transitionUtility(state, { type: 'activate', tool: 'review' })
    expect(transitionUtility(state, { type: 'close' })).toEqual({ kind: 'utilityReady' })
  })
  it.each(utilityTools)('collapses %s and never restores the previous panel', (tool) => {
    const collapsed = transitionUtility({ kind: 'activePanel', tool }, { type: 'collapse' })
    expect(collapsed).toEqual({ kind: 'immersive' })
    expect(transitionUtility(collapsed, { type: 'reveal' })).toEqual({ kind: 'utilityReady' })
  })
  it('has deterministic inapplicable and invalid-tool no-ops', () => {
    const immersive: UtilityState = { kind: 'immersive' }, ready: UtilityState = { kind: 'utilityReady' }
    expect(transitionUtility(immersive, { type: 'activate', tool: 'focus' })).toBe(immersive)
    expect(transitionUtility(immersive, { type: 'collapse' })).toBe(immersive)
    expect(transitionUtility(ready, { type: 'close' })).toBe(ready)
    expect(transitionUtility(ready, { type: 'reveal' })).toBe(ready)
    expect(transitionUtility(ready, { type: 'activate', tool: 'invalid' as UtilityTool })).toBe(ready)
  })
})

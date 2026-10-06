import { describe, expect, it } from 'vitest'
import { emptyWorkspace, routeWorkspace, slots, transitionWorkspace } from './workspace'
import type { Workspace, WorkspaceAction } from './workspace'
import { utilityTools } from '../experience/utilityState'
const open = (tools = ['tasks', 'insights', 'history'] as const) => tools.reduce((state, tool) => transitionWorkspace(state, { type: 'activate', tool }), emptyWorkspace())
describe('functional workspace slots', () => {
  it('assigns open order and replaces the least recently opened auxiliary, preserving Primary', () => {
    let state = open()
    expect(state.slots).toEqual({ primary: 'tasks', auxiliaryA: 'insights', auxiliaryB: 'history' })
    state = transitionWorkspace(state, { type: 'touch', tool: 'insights' })
    state = transitionWorkspace(state, { type: 'activate', tool: 'review' })
    expect(state.slots).toEqual({ primary: 'tasks', auxiliaryA: 'review', auxiliaryB: 'history' })
  })
  it('toggles an open tool closed and promotes the most recently active auxiliary when Primary closes', () => {
    let state = transitionWorkspace(open(), { type: 'touch', tool: 'insights' })
    state = transitionWorkspace(state, { type: 'activate', tool: 'tasks' })
    expect(state.slots).toEqual({ primary: 'insights', auxiliaryA: null, auxiliaryB: 'history' })
    state = transitionWorkspace(state, { type: 'close', tool: 'history' })
    expect(state.slots.auxiliaryB).toBeNull()
    state = transitionWorkspace(state, { type: 'close', tool: 'insights' })
    expect(state.expanded).toBe(true); expect(Object.values(state.slots)).toEqual([null, null, null])
  })
  it('promotes by swapping rather than discarding and swaps auxiliary slots', () => {
    const first = transitionWorkspace(open(), { type: 'promote', tool: 'insights' })
    expect(first.slots).toEqual({ primary: 'insights', auxiliaryA: 'tasks', auxiliaryB: 'history' })
    expect(transitionWorkspace(first, { type: 'swap', from: 'auxiliaryA', to: 'auxiliaryB' }).slots)
      .toEqual({ primary: 'insights', auxiliaryA: 'history', auxiliaryB: 'tasks' })
    expect(transitionWorkspace(first, { type: 'swap', from: 'primary', to: 'auxiliaryB' }).slots)
      .toEqual({ primary: 'history', auxiliaryA: 'tasks', auxiliaryB: 'insights' })
  })
  it('allows moving an auxiliary into an empty auxiliary but never leaves Primary empty', () => {
    const state = transitionWorkspace(open(), { type: 'close', tool: 'history' })
    expect(transitionWorkspace(state, { type: 'swap', from: 'primary', to: 'auxiliaryB' })).toBe(state)
    expect(transitionWorkspace(state, { type: 'swap', from: 'auxiliaryA', to: 'auxiliaryB' }).slots)
      .toEqual({ primary: 'tasks', auxiliaryA: null, auxiliaryB: 'insights' })
  })
  it('collapses tools without changing independent drafts and Reveal starts empty', () => {
    const draft = { title: 'Unsaved', schedule: 'Tomorrow' }, before = structuredClone(draft)
    const state = transitionWorkspace(open(), { type: 'collapse' })
    expect(transitionWorkspace(state, { type: 'reveal' }).slots).toEqual(emptyWorkspace().slots)
    expect(draft).toEqual(before)
  })
  it('applies routed Primary without reconstructing previous compositions or duplicating a tool', () => {
    expect(routeWorkspace(open(), 'history').slots).toEqual({ primary: 'history', auxiliaryA: 'insights', auxiliaryB: 'tasks' })
    expect(routeWorkspace(open(), 'focus').slots).toEqual({ primary: 'focus', auxiliaryA: 'insights', auxiliaryB: 'history' })
    expect(routeWorkspace(open(), null)).toEqual(emptyWorkspace())
  })
  it('maintains uniqueness, maximum three, and occupied Primary over a deterministic mixed sequence', () => {
    let state: Workspace = emptyWorkspace()
    const actions: WorkspaceAction[] = utilityTools.flatMap((tool) => [
      { type: 'activate', tool }, { type: 'close', tool }, { type: 'promote', tool }, { type: 'touch', tool },
    ])
    for (const from of slots) for (const to of slots) actions.push({ type: 'swap', from, to })
    actions.push({ type: 'collapse' }, { type: 'reveal' })
    let seed = 51
    for (let i = 0; i < 1000; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      state = transitionWorkspace(state, actions[seed % actions.length])
      const tools = Object.values(state.slots).filter(Boolean)
      expect(tools.length).toBeLessThanOrEqual(3); expect(new Set(tools).size).toBe(tools.length)
      if (tools.length) expect(state.slots.primary).not.toBeNull()
    }
  })
})

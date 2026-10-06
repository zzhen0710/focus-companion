import { describe, expect, it } from 'vitest'
import { createSceneNavigation, routeTool } from './sceneNavigation'
import type { NavigationPort } from './sceneNavigation'
function fixture(hash = '') {
  const events = new Map<string, Set<() => void>>()
  const writes: string[] = [], location = { hash }
  const port: NavigationPort = { location, history: {
    pushState: (_a, _b, value) => { location.hash = value; writes.push(`push:${value}`) },
    replaceState: (_a, _b, value) => { location.hash = value; writes.push(`replace:${value}`) },
  }, addEventListener: (type, listener) => { if (!events.has(type)) events.set(type, new Set()); events.get(type)!.add(listener) },
  removeEventListener: (type, listener) => { events.get(type)?.delete(listener) } }
  const navigation = createSceneNavigation(port), detach = navigation.attach()
  return { navigation, writes, detach, route(value: string) { location.hash = value; events.get('popstate')?.forEach((fn) => fn()); events.get('hashchange')?.forEach((fn) => fn()) } }
}
describe('workspace primary hash navigation', () => {
  it.each(['focus', 'tasks', 'review', 'history', 'insights'])('hydrates %s as Primary', (tool) => {
    expect(routeTool(`#/${tool}`)).toBe(tool)
    expect(fixture(`#/${tool}`).navigation.getSnapshot().workspace.slots).toEqual({ primary: tool, auxiliaryA: null, auxiliaryB: null })
  })
  it.each(['', '#/', '#/profile', '#/settings', '#/unknown'])('maps %s to immersive', (hash) => {
    expect(routeTool(hash)).toBeNull(); expect(fixture(hash).navigation.getSnapshot().workspace.expanded).toBe(false)
  })
  it('writes only primary changes; auxiliary opening/closing/replacement/swapping is URL-silent', () => {
    const f = fixture()
    f.navigation.dispatch({ type: 'reveal' }); f.navigation.dispatch({ type: 'activate', tool: 'tasks' })
    for (const tool of ['insights', 'history', 'review'] as const) f.navigation.dispatch({ type: 'activate', tool })
    f.navigation.dispatch({ type: 'swap', from: 'auxiliaryA', to: 'auxiliaryB' })
    f.navigation.dispatch({ type: 'close', tool: 'history' })
    expect(f.writes).toEqual(['replace:#/', 'push:#/tasks'])
    f.navigation.dispatch({ type: 'promote', tool: 'review' }); expect(f.writes.at(-1)).toBe('push:#/review')
    f.navigation.dispatch({ type: 'close', tool: 'review' }); expect(f.writes.at(-1)).toBe('replace:#/tasks')
    f.navigation.dispatch({ type: 'collapse' }); f.navigation.dispatch({ type: 'reveal' })
    expect(f.writes.at(-1)).toBe('replace:#/'); expect(f.navigation.getSnapshot().workspace.slots.primary).toBeNull()
  })
  it('applies Back/Forward to the primary context directly, without loops or composition replay', () => {
    const f = fixture('#/focus'); let changes = 0; f.navigation.subscribe(() => changes++)
    f.navigation.dispatch({ type: 'activate', tool: 'tasks' })
    f.route('#/history'); expect(f.navigation.getSnapshot().workspace.slots).toEqual({ primary: 'history', auxiliaryA: 'tasks', auxiliaryB: null })
    f.route('#/focus'); f.route('#/focus'); expect(changes).toBe(3)
    expect(f.writes).toEqual([])
    f.route('#/profile'); expect(f.writes).toEqual(['replace:#/'])
    expect(f.navigation.getSnapshot().workspace.expanded).toBe(false)
    f.detach(); f.route('#/tasks'); expect(f.navigation.getSnapshot().workspace.slots.primary).toBeNull()
  })
})

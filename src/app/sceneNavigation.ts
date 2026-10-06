import { utilityTools } from '../experience/utilityState'
import type { UtilityTool } from '../experience/utilityState'
import { emptyWorkspace, routeWorkspace, transitionWorkspace, toolSlot } from '../scene/workspace'
import type { Workspace, WorkspaceAction } from '../scene/workspace'

export interface NavigationPort {
  location: { hash: string }
  history: { pushState(data: unknown, unused: string, url: string): void; replaceState(data: unknown, unused: string, url: string): void }
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}
export function routeTool(hash: string): UtilityTool | null {
  const tool = hash.slice(2) as UtilityTool
  return hash.startsWith('#/') && utilityTools.includes(tool) ? tool : null
}
export function stateHash(state: Workspace): string { return state.slots.primary ? `#/${state.slots.primary}` : '#/' }
export interface NavigationSnapshot { workspace: Workspace; source: 'initial' | 'action' | 'route'; revision: number; focusTool: UtilityTool | null }
export function createSceneNavigation(port: NavigationPort) {
  const initial = routeWorkspace(emptyWorkspace(), routeTool(port.location.hash))
  let snapshot: NavigationSnapshot = { workspace: initial, source: 'initial', revision: 0, focusTool: initial.slots.primary }
  const listeners = new Set<() => void>()
  function publish(workspace: Workspace, source: NavigationSnapshot['source'], focusTool: UtilityTool | null) {
    snapshot = { workspace, source, revision: snapshot.revision + 1, focusTool }
    listeners.forEach((listener) => listener())
  }
  function external() {
    const tool = routeTool(port.location.hash), hash = tool ? `#/${tool}` : '#/'
    if (port.location.hash !== hash) port.history.replaceState(null, '', hash)
    const workspace = routeWorkspace(snapshot.workspace, tool)
    if (JSON.stringify(snapshot.workspace) !== JSON.stringify(workspace)) publish(workspace, 'route', tool)
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    attach() {
      const hash = stateHash(snapshot.workspace)
      if (port.location.hash !== hash) port.history.replaceState(null, '', hash)
      port.addEventListener('hashchange', external); port.addEventListener('popstate', external)
      return () => { port.removeEventListener('hashchange', external); port.removeEventListener('popstate', external) }
    },
    dispatch(action: WorkspaceAction) {
      const before = snapshot.workspace, workspace = transitionWorkspace(before, action)
      if (workspace === before) return
      if (workspace.slots.primary !== before.slots.primary || action.type === 'collapse') {
        const hash = stateHash(workspace)
        if (action.type === 'close' || action.type === 'collapse' || (action.type === 'activate' && toolSlot(before, action.tool))) port.history.replaceState(null, '', hash)
        else port.history.pushState(null, '', hash)
      }
      const focusTool = action.type === 'touch' ? null : action.type === 'swap' ? before.slots[action.from]
        : 'tool' in action ? action.tool : null
      publish(workspace, 'action', focusTool)
    },
  }
}

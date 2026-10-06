import type { Workspace, WorkspaceAction } from './workspace'
import GlobalUiHandle from './GlobalUiHandle'
import UtilityLaunchers from './UtilityLaunchers'
import { toolLabels } from './scenePresentation'
import type { UtilityTool } from '../experience/utilityState'
import { useRef } from 'react'
import { useReducedMotion, useVisibilityMotion } from './motion'
export default function ToolDrawer({ workspace, error, pendingReview, onAction, onRetry }: {
  workspace: Workspace; error: string | null; pendingReview: number | null; onAction(action: WorkspaceAction): void; onRetry(): void
}) {
  const drawer = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useVisibilityMotion(drawer, workspace.expanded, reduced)
  return <div className="tool-drawer">
    <GlobalUiHandle expanded={workspace.expanded} error={error} onToggle={() => onAction({ type: workspace.expanded ? 'collapse' : 'reveal' })} />
    <div ref={drawer} id="scene-tools" inert={!workspace.expanded} aria-hidden={!workspace.expanded} data-visible={workspace.expanded}>
      <UtilityLaunchers opened={Object.values(workspace.slots)} pendingReview={pendingReview} onActivate={(tool) => onAction({ type: 'activate', tool })} />
      {workspace.slots.primary && <label className="narrow-tool-switcher">Primary
        <select value={workspace.slots.primary} onChange={(event) => onAction({ type: 'promote', tool: event.target.value as UtilityTool })}>
          {Object.values(workspace.slots).filter((tool): tool is UtilityTool => !!tool).map((tool) => <option key={tool} value={tool}>{toolLabels[tool]}</option>)}
        </select></label>}
      {error && !workspace.slots.primary && <div className="drawer-error scene-glass" role="status"><p>{error}</p><button onClick={onRetry}>Retry saving / loading</button></div>}
    </div>
  </div>
}

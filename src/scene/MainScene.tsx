import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { NavigationSnapshot } from '../app/sceneNavigation'
import type { WorkspaceAction } from './workspace'
import type { UtilityTool } from '../experience/utilityState'
import type { ExpressionIntent } from '../experience/rules'
import type { MessageKey } from '../experience/messages'
import { sceneFocusTarget } from './scenePresentation'
import SceneArtwork from './SceneArtwork'
import ToolDrawer from './ToolDrawer'
import BubbleWorkspace from './BubbleWorkspace'
import CompanionMessageStrip from './CompanionMessageStrip'
import './MainScene.css'

export default function MainScene({ navigation, intent, error, pendingReview, primary, compact, message, messageCollapsed, onMessageToggle, onAction, onRetry }: {
  navigation: NavigationSnapshot; intent: ExpressionIntent; error: string | null; pendingReview: number | null
  primary: ReactNode; compact(tool: UtilityTool): ReactNode; message: { key: MessageKey; text: string } | null
  messageCollapsed: boolean; onMessageToggle(): void; onAction(action: WorkspaceAction): void; onRetry(): void
}) {
  const root = useRef<HTMLElement>(null), previous = useRef<NavigationSnapshot | null>(null)
  const retryRequested = useRef(false)
  const workspace = navigation.workspace
  useEffect(() => {
    const before = previous.current
    previous.current = navigation
    if (before && before.workspace.expanded === workspace.expanded && JSON.stringify(before.workspace.slots) === JSON.stringify(workspace.slots)) return
    const target = root.current?.querySelector<HTMLElement>(sceneFocusTarget(workspace, navigation.focusTool))
    const visibleTarget = target?.getClientRects().length ? target
      : root.current?.querySelector<HTMLElement>(sceneFocusTarget(workspace, workspace.slots.primary))
    visibleTarget?.focus()
  }, [navigation, workspace])
  useEffect(() => {
    if (!error && retryRequested.current) {
      retryRequested.current = false
      if (!root.current?.contains(document.activeElement)) root.current?.querySelector<HTMLElement>(sceneFocusTarget(workspace, workspace.slots.primary))?.focus()
    }
  }, [error, workspace])
  return <main ref={root} className="main-scene" aria-label="Focus Companion" data-tools-expanded={workspace.expanded}
    onClickCapture={(event) => { if ((event.target as HTMLElement).closest('[data-retry]')) retryRequested.current = true }} onKeyDown={(event) => {
    if (event.key !== 'Escape' || event.defaultPrevented || (event.target as HTMLElement).tagName === 'SELECT') return
    const menu = (event.target as HTMLElement).closest('details[open]')
    if (menu) { menu.removeAttribute('open'); menu.querySelector('summary')?.focus() }
    else {
      const tool = (event.target as HTMLElement).closest<HTMLElement>('[data-functional-tool]')?.dataset.functionalTool as UtilityTool | undefined
      if (tool) onAction({ type: 'close', tool })
      else if (workspace.slots.primary) onAction({ type: 'close', tool: workspace.slots.primary })
      else if (workspace.expanded) onAction({ type: 'collapse' })
      else return
    }
    event.preventDefault(); event.stopPropagation()
  }}>
    <SceneArtwork presence={intent.presence} />
    <div className="scene-ui">
      <ToolDrawer workspace={workspace} error={error} pendingReview={pendingReview} onAction={onAction} onRetry={onRetry} />
      <BubbleWorkspace workspace={workspace} primary={primary} compact={compact} error={error} onAction={onAction} onRetry={onRetry} />
      <CompanionMessageStrip message={message} collapsed={messageCollapsed} onToggle={onMessageToggle} />
    </div>
  </main>
}

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import MainScene from './MainScene'
import CompanionMessageStrip from './CompanionMessageStrip'
import { emptyWorkspace, transitionWorkspace } from './workspace'
import type { Workspace } from './workspace'
import { utilityTools } from '../experience/utilityState'
const intent = { presence: 'neutral' as const, primaryReaction: null, ambient: null }
function markup(workspace: Workspace, collapsed = false) {
  return renderToStaticMarkup(<MainScene navigation={{ workspace, source: 'initial', revision: 0, focusTool: workspace.slots.primary }}
    intent={intent} error={null} pendingReview={2} primary={<p>Full workflow</p>} compact={(tool) => <p>Compact {tool}</p>}
    message={{ key: 'neutralAmbient', text: 'One thing at a time.' }} messageCollapsed={collapsed} onMessageToggle={() => {}}
    onAction={() => {}} onRetry={() => {}} />)
}
describe('three-slot scene structure', () => {
  it('keeps independent real message text while tools are collapsed', () => {
    const html = markup(emptyWorkspace())
    expect(html).toContain('aria-label="Show tools" aria-expanded="false" aria-controls="scene-tools"')
    expect(html).toContain('data-message-strip'); expect(html).toContain('One thing at a time.')
    expect(html).not.toContain('data-functional-tool')
    expect(html).toContain('id="scene-tools" inert="" aria-hidden="true" data-visible="false"')
    expect(html).toContain('Temporary structural artwork')
  })
  it.each(utilityTools)('uses five stable named round launchers with %s Primary', (tool) => {
    const state = transitionWorkspace(emptyWorkspace(), { type: 'activate', tool }), html = markup(state)
    expect([...html.matchAll(/data-launcher="([^"]+)"/g)].map((m) => m[1])).toEqual(utilityTools)
    for (const name of ['Focus', 'Tasks', 'Review', 'History', 'Insights']) expect(html).toContain(`aria-label="${name}" title="${name}"`)
    expect(html).toContain('aria-label="Hide tools"')
    expect(html.match(/data-functional-tool=/g)).toHaveLength(1)
    expect(html).toContain('Full workflow'); expect(html).not.toContain('Compact '+tool)
    expect(html).not.toContain('data-layout=')
  })
  it('renders Primary plus two explicit compact views, with message outside the slot budget', () => {
    let state = emptyWorkspace()
    for (const tool of ['tasks', 'insights', 'history'] as const) state = transitionWorkspace(state, { type: 'activate', tool })
    const html = markup(state)
    expect(html.match(/data-functional-tool=/g)).toHaveLength(3)
    expect(html.match(/data-view="compact"/g)).toHaveLength(2)
    expect(html).toContain('Compact insights'); expect(html).toContain('Promote to Primary')
    expect(html).toContain('Move to Aux B'); expect(html).toContain('Drag Tasks between slots')
    const art = (text: string) => text.slice(text.indexOf('<svg'), text.indexOf('</svg>') + 6)
    expect(art(html)).toBe(art(markup(emptyWorkspace())))
    expect(html).not.toContain('role="region"')
  })
  it('collapses/restores only the current-message strip, with no history/board', () => {
    const render = (collapsed: boolean) => renderToStaticMarkup(<CompanionMessageStrip message={{ key: 'neutralAmbient', text: 'Current only' }} collapsed={collapsed} onToggle={() => {}} />)
    expect(render(true)).toContain('aria-label="Show companion message" aria-expanded="false"')
    expect(render(true)).toContain('id="companion-current-message" aria-hidden="true" data-visible="false"')
    expect(render(false)).toContain('aria-label="Hide companion message" aria-expanded="true"')
    expect(render(false)).not.toContain('message-board')
  })
})

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MainSceneView } from './MainScenePrototype'
import { createPrototypeRuntime } from './fixtures'
import { changePresentation, initialPrototypeState } from './prototypeState'
import { utilityTools } from '../../experience/utilityState'
import type { PrototypeState } from './prototypeState'

const noop = () => {}
function markup(state: PrototypeState, runtime = createPrototypeRuntime()) {
  return renderToStaticMarkup(<MainSceneView state={state} snapshot={runtime.getSnapshot()} onAction={noop}
    onDraft={noop} onDecision={noop} onConfirm={noop} onRetry={noop} />)
}
describe('isolated prototype state and markup', () => {
  it('retains a draft across switching and collapse without confirming business actions', () => {
    let state = { ...initialPrototypeState(), draft: 'Read slowly' }
    state = changePresentation(state, { type: 'reveal' })
    state = changePresentation(state, { type: 'activate', tool: 'tasks' })
    state = { ...state, confirmation: true }
    state = changePresentation(state, { type: 'activate', tool: 'insights' })
    expect(state.confirmation).toBe(false)
    state = changePresentation(state, { type: 'activate', tool: 'tasks' })
    state = { ...state, confirmation: true }
    state = changePresentation(state, { type: 'collapse' })
    expect(state).toEqual({ utility: { kind: 'immersive' }, draft: 'Read slowly', confirmation: false, decisionMessage: '' })
    state = changePresentation(state, { type: 'reveal' })
    state = changePresentation(state, { type: 'activate', tool: 'tasks' })
    expect(markup(state)).toContain('value="Read slowly"')
    expect(markup(state)).not.toContain('Confirm sample deletion')
  })
  it('clears confirmation on close and same-launcher toggle', () => {
    const state: PrototypeState = { ...initialPrototypeState(), utility: { kind: 'activePanel', tool: 'tasks' }, confirmation: true }
    expect(changePresentation(state, { type: 'close' }).confirmation).toBe(false)
    expect(changePresentation(state, { type: 'activate', tool: 'tasks' }).confirmation).toBe(false)
  })
  it('starts immersive with an accessible Show handle and no hidden focusable launchers', () => {
    const html = markup(initialPrototypeState())
    expect(html).toContain('aria-label="Show controls" aria-expanded="false" aria-controls="prototype-utilities"')
    expect(html).toContain('id="prototype-utilities" class="utility-layer" hidden=""')
    expect(html).not.toContain('data-launcher='); expect(html).not.toContain('data-panel=')
  })
  it.each(utilityTools)('renders exactly one %s panel with native launchers and Hide semantics', (tool) => {
    const html = markup({ ...initialPrototypeState(), utility: { kind: 'activePanel', tool } })
    expect(html).toContain('aria-label="Hide controls" aria-expanded="true"')
    expect(html.match(/data-launcher=/g)).toHaveLength(6)
    expect(html.match(/data-panel=/g)).toHaveLength(1)
    expect(html).toContain(`data-panel="${tool}"`)
    expect(html).not.toContain('aria-modal="true"')
  })
  it('keeps error discoverable while collapsed and exposes recovery without auto-opening a panel', () => {
    const runtime = createPrototypeRuntime(); runtime.fail()
    const hidden = markup(initialPrototypeState(), runtime)
    expect(hidden).toContain('needs-attention'); expect(hidden).toContain('aria-describedby="prototype-attention"')
    expect(hidden).not.toContain('Retry fixture')
    const revealed = markup({ ...initialPrototypeState(), utility: { kind: 'utilityReady' } }, runtime)
    expect(revealed).toContain('Retry fixture'); expect(revealed).toContain('Showing last loaded facts')
    expect(revealed).not.toContain('data-panel=')
  })
  it('batches simultaneous fixture commits and never retriggers reconstructed snapshots', () => {
    const runtime = createPrototypeRuntime(() => new Date(2026, 9, 6, 12).getTime())
    runtime.setScenario('focus-running'); runtime.commit('both')
    expect(runtime.getSnapshot().intent.primary?.kind).toBe('focusAcknowledgment')
    expect(runtime.getSnapshot().reactionCount).toBe(1)
    runtime.refresh(); runtime.refresh(); runtime.advance(11_000); runtime.refresh()
    expect(runtime.getSnapshot().intent.primary).toBeNull()
    expect(runtime.getSnapshot().reactionCount).toBe(1)
  })
  it('exposes English factual copy and a quiet Review cue without opening Review', () => {
    const runtime = createPrototypeRuntime(); runtime.setScenario('review-pending'); runtime.tick()
    const html = markup(initialPrototypeState(), runtime)
    expect(html).toContain('A little work to revisit')
    expect(html).not.toContain('data-panel="review"')
    expect(markup({ ...initialPrototypeState(), utility: { kind: 'activePanel', tool: 'insights' } }, runtime))
      .toContain('Completed sessions')
  })
  it('keeps the same persistent human study scene beneath every utility card', () => {
    const immersive = markup(initialPrototypeState())
    const art = (html: string) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>') + 6)
    expect(immersive).toContain('A human companion sharing a quiet study room')
    expect(immersive).toContain('class="furniture-layer"')
    expect(immersive).toContain('class="foreground-layer"')
    for (const tool of utilityTools) {
      const html = markup({ ...initialPrototypeState(), utility: { kind: 'activePanel', tool } })
      expect(art(html)).toBe(art(immersive))
      expect(html).toContain('class="panel-heading"')
      expect(html).toContain(`class="panel-content" role="region" aria-label="${tool[0].toUpperCase() + tool.slice(1)} content" tabindex="0"`)
    }
  })
  it('retains dense Insights content inside the common card structure', () => {
    const html = markup({ ...initialPrototypeState(), utility: { kind: 'activePanel', tool: 'insights' } })
    expect(html).toContain('class="utility-panel" data-panel="insights"')
    for (const label of ['Today focused', 'Completed sessions', 'Interrupted sessions', 'Task completions',
      'Reviews completed', 'Focus · Last 7 days']) expect(html).toContain(label)
    expect(html.match(/class="sample-bar"/g)).toHaveLength(7)
  })
})

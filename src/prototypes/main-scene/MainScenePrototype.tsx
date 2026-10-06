import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { KeyboardEvent } from 'react'
import { attachReadRefresh } from '../../app/readRefresh'
import { utilityTools } from '../../experience/utilityState'
import type { UtilityAction } from '../../experience/utilityState'
import { changePresentation, initialPrototypeState } from './prototypeState'
import type { PrototypeState } from './prototypeState'
import { createPrototypeRuntime, denseRows, historyRows, scenarios, taskRows } from './fixtures'
import type { PrototypeSnapshot, Scenario } from './fixtures'
import PrototypeScene from './PrototypeScene'

const labels = { focus: 'Focus', tasks: 'Tasks', review: 'Review', history: 'History', insights: 'Insights' }
function minutes(ms: number) {
  const seconds = Math.ceil(ms / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}
function fixtureError(snapshot: PrototypeSnapshot): string | null {
  const { saved, focus } = snapshot.context
  return saved.status === 'stale' || saved.status === 'unavailable' ? saved.error
    : focus.status === 'unavailable' ? focus.error : focus.status === 'ready' ? focus.value.error : null
}

interface ViewProps {
  state: PrototypeState
  snapshot: PrototypeSnapshot
  onAction(action: UtilityAction): void
  onDraft(value: string): void
  onDecision(value: boolean): void
  onConfirm(): void
  onRetry(): void
}
export function MainSceneView({ state, snapshot, onAction, onDraft, onDecision, onConfirm, onRetry }: ViewProps) {
  const root = useRef<HTMLElement>(null)
  const previous = useRef({ utility: state.utility, confirmation: state.confirmation })
  const utility = state.utility, expanded = utility.kind !== 'immersive'
  const active = utility.kind === 'activePanel' ? utility.tool : null
  const error = fixtureError(snapshot), { context } = snapshot
  const focus = context.focus.status === 'ready' ? context.focus.value : null
  const saved = context.saved.status === 'ready' || context.saved.status === 'stale' ? context.saved.value : null

  useEffect(() => {
    const before = previous.current
    let selector: string | null = null
    if (utility !== before.utility) selector = utility.kind === 'immersive' ? '[data-handle]'
      : utility.kind === 'activePanel' ? '[data-panel-heading]'
        : before.utility.kind === 'activePanel' ? `[data-launcher="${before.utility.tool}"]` : null
    else if (state.confirmation !== before.confirmation) selector = state.confirmation ? '[data-confirm-action]' : '[data-request-delete]'
    previous.current = { utility, confirmation: state.confirmation }
    if (selector) root.current?.querySelector<HTMLElement>(selector)?.focus()
  }, [utility, state.confirmation])

  function escape(event: KeyboardEvent) {
    // Let native selects handle their own popup first.
    if (event.key !== 'Escape' || event.defaultPrevented || (event.target as HTMLElement).tagName === 'SELECT') return
    if (state.confirmation) onDecision(false)
    else if (active) onAction({ type: 'close' })
    else if (expanded) onAction({ type: 'collapse' })
    else return
    event.preventDefault(); event.stopPropagation()
  }

  return <main ref={root} className="main-scene" data-state={utility.kind} onKeyDown={escape} aria-label="Main Scene prototype">
    <PrototypeScene intent={snapshot.intent} />
    <button type="button" className={`global-ui-handle${error ? ' needs-attention' : ''}`} data-handle
      aria-label={expanded ? 'Hide controls' : 'Show controls'} aria-expanded={expanded} aria-controls="prototype-utilities"
      aria-describedby={error ? 'prototype-attention' : undefined} onClick={() => onAction({ type: expanded ? 'collapse' : 'reveal' })}>
      <span className="handle-mark" aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
    </button>
    {error && <span id="prototype-attention" className="prototype-sr-only">A fixture error needs attention. Reveal controls for details.</span>}
    <div id="prototype-utilities" className="utility-layer" hidden={!expanded}>
      {expanded && <>
        <nav className="utility-launchers" aria-label="Utilities">
          {utilityTools.map((tool) => <button type="button" key={tool} data-launcher={tool} aria-pressed={active === tool}
            onClick={() => onAction({ type: 'activate', tool })}>{labels[tool]}
            {tool === 'review' && saved && saved.review.remainingCount > 0 && <span className="pending-mark" aria-label="Pending work"> ·</span>}
          </button>)}
        </nav>
        {error && <div className="fixture-error" role="status">
          <strong>Fixture unavailable</strong><p>{error}</p>
          {context.saved.status === 'stale' && <p>Showing last loaded facts from {saved?.localDate}.</p>}
          <button type="button" onClick={onRetry}>Retry fixture</button>
        </div>}
        {active && <section className="utility-panel" data-panel={active} aria-labelledby="prototype-panel-title">
          <header className="panel-heading"><h1 id="prototype-panel-title" tabIndex={-1} data-panel-heading>{labels[active]}</h1>
            <button type="button" className="close-panel" aria-label={`Close ${labels[active]}`} onClick={() => onAction({ type: 'close' })}>×</button></header>
          <div className="panel-content" role="region" aria-label={`${labels[active]} content`} tabIndex={0}>
            {active === 'focus' && <>
              <p className="context-hint">One period, at your pace.</p>
              {focus ? <>
                <output className="fixture-timer" role="timer" aria-live="off" aria-label="Fixture remaining time">{minutes(focus.remainingMs)}</output>
                <p>{focus.mode === 'focus' ? 'Focus' : 'Break'} · {focus.status}</p>
                <p>Captured at Start: {focus.capturedTarget?.historicalTitle ?? 'No captured task'}</p>
                <p>Current task: {focus.currentTarget.status === 'ready' ? focus.currentTarget.value?.title ?? 'Unavailable task' : 'Unknown'}</p>
                {(focus.pendingCompletion || focus.pendingReset) && <p>Saving is pending. No new history is counted.</p>}
              </> : <p>Timer fixture is unavailable.</p>}
              <p className="panel-footnote">A factual preview, not a working timer.</p>
            </>}
            {active === 'tasks' && <>
              <ul className="fixture-task-list">{taskRows.map((title) => <li key={title}>{title}</li>)}</ul>
              <label className="draft-label">Task draft<input value={state.draft} onChange={(event) => onDraft(event.target.value)} placeholder="One small next step" /></label>
              <p className="context-hint">Your draft stays here while you open another tool.</p>
              <button type="button" data-request-delete onClick={() => onDecision(true)}>Request sample deletion</button>
              {state.confirmation && <div className="local-decision" role="group" aria-label="Sample deletion confirmation">
                <p>Remove this sample? This is a local decision fixture.</p>
                <button type="button" data-confirm-action onClick={onConfirm}>Confirm sample deletion</button>
                <button type="button" onClick={() => onDecision(false)}>Keep sample</button>
              </div>}
              <p role="status">{state.decisionMessage}</p>
            </>}
            {active === 'review' && <>
              <p className="context-hint">A moment to decide what comes next.</p>
              <p>{saved ? `${saved.review.remainingCount} pending task${saved.review.remainingCount === 1 ? '' : 's'}` : 'Pending work is unknown.'}</p>
              <p>You opened this review. No work has been resolved.</p>
              <p className="panel-footnote">Review decisions stay in the production core.</p>
            </>}
            {active === 'history' && <>
              <p className="context-hint">A record of what happened.</p>
              <ol className="fixture-history">{[...historyRows, ...historyRows].map((row, index) => <li key={index}>{row}</li>)}</ol>
              <p className="panel-footnote">Illustrative chronological rows for layout review.</p>
            </>}
            {active === 'insights' && <>
              <p className="context-hint">Saved facts · {saved?.localDate ?? 'Unknown date'}</p>
              {saved && <div className="saved-summary"><span>Today focused</span><strong>{minutes(saved.todayFocus.focusedSeconds * 1000)}</strong></div>}
              <h2>Composition sample</h2><dl className="fixture-metrics">{denseRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <h2>Focus · Last 7 days</h2><div className="fixture-trend">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) =>
                <div key={day}><span>{day}</span><span className="sample-bar" style={{ width: `${[55, 72, 35, 88, 48, 20, 65][index]}%` }} /><span>2 sessions</span></div>)}</div>
              <p className="panel-footnote">Illustrative metrics below Today focused test density; they are not live analytics.</p>
            </>}
          </div>
        </section>}
      </>}
    </div>
  </main>
}

export default function MainScenePrototype() {
  const [runtime] = useState(() => createPrototypeRuntime())
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot)
  const [state, setState] = useState(initialPrototypeState)
  const [lab] = useState(() => new URLSearchParams(window.location.search).get('lab') === '1')

  useEffect(() => {
    const visibility = () => runtime.setAttention({ visible: document.visibilityState === 'visible' })
    visibility()
    const timer = window.setInterval(runtime.tick, 1000)
    const detach = attachReadRefresh(runtime.refresh, document, window)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.clearInterval(timer); detach(); document.removeEventListener('visibilitychange', visibility) }
  }, [runtime])

  function action(event: UtilityAction) {
    const next = changePresentation(state, event)
    runtime.setAttention({ decisionActive: next.confirmation, reviewOpen: next.utility.kind === 'activePanel' && next.utility.tool === 'review' })
    setState(next)
  }
  function decision(value: boolean) {
    runtime.setAttention({ decisionActive: value })
    setState({ ...state, confirmation: value, decisionMessage: '' })
  }
  return <div className="prototype-root">
    <MainSceneView state={state} snapshot={snapshot} onAction={action} onDraft={(draft) => setState({ ...state, draft })}
      onDecision={decision} onConfirm={() => {
        runtime.setAttention({ decisionActive: false })
        setState({ ...state, confirmation: false, decisionMessage: 'Sample decision confirmed. No user data changed.' })
      }} onRetry={runtime.retry} />
    {lab && <aside className="prototype-lab" aria-label="Prototype lab">
      <h2>Composition lab</h2><p>In-memory fixtures · separate from production data</p>
      <label>Scenario<select defaultValue="idle" onChange={(event) => runtime.setScenario(event.target.value as Scenario)}>
        {scenarios.map((scenario) => <option key={scenario} value={scenario}>{scenario}</option>)}
      </select></label>
      <div className="lab-actions">
        <button onClick={() => runtime.commit('focus')}>Commit Focus fixture</button>
        <button onClick={() => runtime.commit('task')}>Commit Task fixture</button>
        <button onClick={() => runtime.commit('both')}>Commit both fixtures</button>
        <button onClick={() => runtime.commit('interrupted')}>Commit interruption fixture</button>
        <button onClick={runtime.refresh}>Refresh same facts</button>
        <button onClick={runtime.fail}>Fail saved read</button>
        <button onClick={runtime.retry}>Recover fixture</button>
        <button onClick={() => runtime.advance(31_000)}>Advance 31 seconds</button>
        <button onClick={runtime.midnight}>Advance to midnight</button>
      </div>
      <output className="lab-observation">{snapshot.context.localDate} · {snapshot.context.dayPhase} · Saved: {snapshot.context.saved.status}
        {' · '}Presence: {snapshot.intent.presence} · Primary: {snapshot.intent.primaryReaction?.kind ?? 'none'} · Reactions: {snapshot.reactionCount}</output>
    </aside>}
  </div>
}

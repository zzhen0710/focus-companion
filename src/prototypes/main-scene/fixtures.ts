import type { Available, LiveFocus, SavedFacts } from '../../experience/context'
import type { FactsLoad } from '../../experience/contextStore'
import { addCalendarDays, localCalendarDate } from '../../domain/taskSchedule'
import { transitionTimer } from '../../domain/timer'
import { createExperienceContextStore } from '../../experience/contextStore'
import { evaluateExperience, initialRuleMemory } from '../../experience/rules'
import type { Attention } from '../../experience/rules'

export const scenarios = ['idle', 'focus-running', 'focus-paused', 'break-running', 'unknown-timer',
  'pending-completion', 'pending-reset', 'review-pending', 'load-failure', 'renamed-task', 'deleted-task'] as const
export type Scenario = typeof scenarios[number]
const settings = { focusDurationSeconds: 1500, shortBreakDurationSeconds: 300, longBreakDurationSeconds: 900 }

/** In-memory lab only. No application bootstrap, storage, or workflow service. */
export function createFixtureSource(clock: () => number = Date.now) {
  let offset = 0
  const now = () => clock() + offset
  let facts: SavedFacts
  let live: Available<LiveFocus>
  let failure = false
  let sequence = 0
  function setScenario(scenario: Scenario) {
    const time = now(), today = localCalendarDate(time)
    facts = {
      tasks: [
        { id: 'read', title: 'Read a chapter', content: null, categoryId: null, status: 'open',
          schedule: { kind: 'unscheduled' }, createdAt: time - 86400000, completedAt: null, droppedAt: null },
        { id: 'notes', title: 'Put a thought on paper', content: null, categoryId: null, status: 'open',
          schedule: { kind: 'date', date: scenario === 'review-pending' ? addCalendarDays(today, -1) : today, timeRange: null },
          createdAt: time - 86400000, completedAt: null, droppedAt: null },
      ],
      sessions: [{ id: `baseline-${++sequence}`, taskId: 'read', categoryId: null, taskTitleSnapshot: 'Read a chapter',
        startedAt: time - 4500000, endedAt: time - 3600000, durationSeconds: 900, plannedDurationSeconds: 900, outcome: 'completed' }],
      taskEvents: [], activeReview: null,
    }
    let timer = transitionTimer({ status: 'idle', mode: scenario === 'break-running' ? 'shortBreak' : 'focus' },
      { type: 'start', id: 'fixture-period', taskId: 'read', taskTitleSnapshot: 'Read a chapter' }, settings, time - 180000)
    if (scenario === 'focus-paused') timer = transitionTimer(timer, { type: 'pause' }, settings, time)
    if (scenario === 'idle' || scenario === 'review-pending' || scenario === 'load-failure') timer = { status: 'idle', mode: 'focus' }
    if (scenario === 'pending-completion' && timer.status !== 'idle') timer = { ...timer, status: 'completed',
      accumulatedMs: timer.durationMs, endedAt: time }
    if (scenario === 'pending-reset') timer = transitionTimer(timer, { type: 'pause' }, settings, time)
    live = scenario === 'unknown-timer' ? { status: 'unavailable', error: 'Timer fixture is unavailable.' }
      : { status: 'ready', asOf: time, value: { timer, settings, pendingCompletion: scenario === 'pending-completion',
        pendingReset: scenario === 'pending-reset', error: scenario.startsWith('pending-') ? 'Fixture save is pending. Retry to recover.' : null } }
    if (scenario === 'renamed-task') facts = { ...facts, tasks: facts.tasks.map((task) => task.id === 'read'
      ? { ...task, title: 'Read the revised chapter', status: 'completed', completedAt: time } : task) }
    if (scenario === 'deleted-task') facts = { ...facts, tasks: facts.tasks.filter((task) => task.id !== 'read') }
    failure = scenario === 'load-failure'
  }
  function commit(kind: 'focus' | 'task' | 'both' | 'interrupted') {
    const time = now(), id = `new-${++sequence}`
    if (kind !== 'task') {
      facts = { ...facts, sessions: [...facts.sessions, { id, taskId: 'read', categoryId: null, taskTitleSnapshot: 'Read a chapter',
        startedAt: time - 1500000, endedAt: time, durationSeconds: kind === 'interrupted' ? 180 : 1500,
        plannedDurationSeconds: 1500, outcome: kind === 'interrupted' ? 'interrupted' : 'completed' }] }
      if (live.status === 'ready' && kind !== 'interrupted') live = { ...live, value: { ...live.value,
        timer: { status: 'completed', mode: 'focus', id, startedAt: time - 1500000, durationMs: 1500000,
          accumulatedMs: 1500000, endedAt: time, taskId: 'read', categoryId: null, taskTitleSnapshot: 'Read a chapter' } } }
    }
    if (kind === 'task' || kind === 'both') facts = { ...facts, taskEvents: [...facts.taskEvents,
      { id, type: 'taskCompleted', taskId: 'read', categoryId: null, reviewId: null, occurredAt: time,
        taskSnapshot: { title: 'Read a chapter', schedule: { kind: 'unscheduled' } } }] }
  }
  setScenario('idle')
  return {
    now, setScenario, commit,
    load(): FactsLoad { return failure ? { status: 'unavailable', error: 'Saved fixture facts could not be loaded. Retry when ready.' }
      : { status: 'ready', facts } },
    getLive: () => live,
    fail() { failure = true },
    recover() {
      failure = false
      if (live.status === 'ready') live = { ...live, value: { ...live.value, error: null, pendingCompletion: false, pendingReset: false } }
    },
    advance(ms: number) { offset += ms },
    toMidnight() { const date = new Date(now()); date.setHours(24, 0, 1, 0); offset += date.getTime() - now() },
  }
}
export type FixtureSource = ReturnType<typeof createFixtureSource>

/** Prototype composition only. Batch fixture changes so rules see one coherent observation. */
export function createPrototypeRuntime(clock: () => number = Date.now) {
  const source = createFixtureSource(clock)
  const context = createExperienceContextStore(source.load, source.now)
  context.refreshSaved(); context.updateLive(source.getLive()); context.selectTask('notes')
  let memory = initialRuleMemory()
  let attention: Attention = { visible: true, decisionActive: false, reviewOpen: false, blockingError: false }
  let reactionCount = 0
  let snapshot = observe()
  let batching = false
  const listeners = new Set<() => void>()
  function observe() {
    const state = context.getSnapshot()
    const error = state.saved.status === 'stale' || state.saved.status === 'unavailable' ||
      state.focus.status === 'unavailable' || (state.focus.status === 'ready' && !!state.focus.value.error)
    const result = evaluateExperience(state, { ...attention, blockingError: error }, memory)
    if (result.intent.primaryReaction && result.intent.primaryReaction.factId !== memory.primaryReaction?.factId) reactionCount++
    memory = result.nextMemory
    return { context: state, intent: result.intent, reactionCount }
  }
  function publish() { snapshot = observe(); listeners.forEach((listener) => listener()) }
  context.subscribe(() => { if (!batching) publish() })
  function update(action: () => void) {
    batching = true
    try { action() } finally { batching = false }
    publish()
  }
  const refresh = () => update(() => { context.refreshSaved(); context.updateLive(source.getLive()) })
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    tick: context.tick,
    refresh,
    setAttention(change: Partial<Attention>) { attention = { ...attention, ...change }; publish() },
    setScenario(scenario: Scenario) {
      memory = { ...initialRuleMemory(), reviewOffered: memory.reviewOffered }
      update(() => { source.setScenario(scenario); context.refreshSaved(); context.updateLive(source.getLive()) })
    },
    commit(kind: Parameters<FixtureSource['commit']>[0]) { update(() => {
      source.commit(kind); context.refreshSaved(); context.updateLive(source.getLive())
    }) },
    fail() { source.fail(); refresh() },
    retry() { source.recover(); refresh() },
    advance(ms: number) { source.advance(ms); context.tick() },
    midnight() { source.toMidnight(); context.tick() },
  }
}
export type PrototypeRuntime = ReturnType<typeof createPrototypeRuntime>
export type PrototypeSnapshot = ReturnType<PrototypeRuntime['getSnapshot']>

// Curated presentation examples, not raw domain documents.
export const taskRows = ['Read a chapter', 'Put a thought on paper']
export const historyRows = ['09:40 · Focus · 25 minutes', '09:10 · Task completed · Read a chapter',
  'Yesterday · Focus · 18 minutes interrupted', 'Yesterday · Review · 2 tasks reviewed']
export const denseRows = [
  ['Focused', '43 minutes'], ['Completed sessions', '1'], ['Interrupted sessions', '1'],
  ['Sessions', '2'], ['Completion rate', '50%'], ['Average session', '21m 30s'],
  ['Task completions', '1'], ['Reviews completed', '1'],
] as const

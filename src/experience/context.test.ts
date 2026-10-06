import { describe, expect, it } from 'vitest'
import { projectContext, projectSavedFacts } from './context'
import { elapsedMs, remainingMs } from '../domain/timer'
import { createFixtureSource } from '../prototypes/main-scene/fixtures'
import type { SavedFacts } from './context'

const now = new Date(2026, 9, 6, 12).getTime()
function input(scenario: Parameters<ReturnType<typeof createFixtureSource>['setScenario']>[0] = 'idle') {
  const source = createFixtureSource(() => now)
  source.setScenario(scenario)
  const loaded = source.load()
  if (loaded.status !== 'ready') throw new Error('Expected fixture facts')
  return { source, facts: loaded.facts }
}
describe('curated factual experience context', () => {
  it('reuses live Timer calculations without adding live time to saved Insights', () => {
    const { source, facts } = input('focus-running'), live = source.getLive()
    const saved = projectSavedFacts(facts, now)
    const context = projectContext({ status: 'ready', value: saved, asOf: now },
      { status: 'ready', value: facts.tasks, asOf: now }, live, 'notes', now + 1000)
    if (live.status !== 'ready' || context.focus.status !== 'ready') throw new Error('Expected live state')
    expect(context.focus.value.elapsedMs).toBe(elapsedMs(live.value.timer, now + 1000))
    expect(context.focus.value.remainingMs).toBe(remainingMs(live.value.timer, live.value.settings, now + 1000))
    expect(saved.todayFocus.focusedSeconds).toBe(900)
    expect(context.selection.currentTask).toMatchObject({ value: { id: 'notes' } })
    expect(context.focus.value.capturedTarget?.taskId).toBe('read')
  })
  it.each(['pending-completion', 'pending-reset'] as const)('does not treat %s as committed history', (scenario) => {
    const { source, facts } = input(scenario)
    const saved = projectSavedFacts(facts, now)
    expect(saved.todayFocus.sessionCount).toBe(1)
    expect(saved.lastFocus?.id).toMatch(/^baseline-/)
    const context = projectContext({ status: 'ready', value: saved, asOf: now },
      { status: 'ready', value: facts.tasks, asOf: now }, source.getLive(), null, now)
    expect(context.focus).toMatchObject({ value: scenario === 'pending-completion' ? { pendingCompletion: true } : { pendingReset: true } })
  })
  it('separates current Task corrections from immutable captured titles', () => {
    const { source, facts } = input('renamed-task')
    const context = projectContext({ status: 'ready', value: projectSavedFacts(facts, now), asOf: now },
      { status: 'ready', value: facts.tasks, asOf: now }, source.getLive(), 'notes', now)
    expect(context.focus).toMatchObject({ value: { capturedTarget: { historicalTitle: 'Read a chapter' },
      currentTarget: { value: { title: 'Read the revised chapter', status: 'completed' } } } })
    expect(context.saved).toMatchObject({ value: { lastFocus: { historicalTitle: 'Read a chapter' } } })
    expect(context.selection.taskId).toBe('notes')
  })
  it('distinguishes missing reference, No task, and unavailable lookup', () => {
    const { source, facts } = input('deleted-task')
    const context = projectContext({ status: 'loading' }, { status: 'ready', value: facts.tasks, asOf: now }, source.getLive(), 'read', now)
    expect(context.selection).toMatchObject({ taskId: 'read', currentTask: { status: 'ready', value: null } })
    expect(projectContext({ status: 'loading' }, { status: 'loading' }, { status: 'loading' }, null, now).selection)
      .toEqual({ taskId: null, currentTask: { status: 'loading' } })
  })
  it('uses existing overdue and bounded Review-cohort rules without settlement', () => {
    const { facts } = input('review-pending')
    const draft = { id: 'review', startedAt: now, localDate: '2026-10-06', taskIds: ['notes'] }
    const saved = projectSavedFacts({ ...facts, activeReview: draft }, now)
    expect(saved.overdueCount).toBe(1)
    expect(saved.review).toEqual({ id: 'review', remainingCount: 1 })
    expect(draft.taskIds).toEqual(['notes'])
  })
  it('known empty facts have zero counts and null metrics', () => {
    const empty: SavedFacts = { tasks: [], sessions: [], taskEvents: [], activeReview: null }
    expect(projectSavedFacts(empty, now).todayFocus).toEqual({ focusedSeconds: 0, completedCount: 0, interruptedCount: 0,
      sessionCount: 0, completionRate: null, averageSeconds: null })
  })
  it.each(['loading', 'unavailable', 'stale'] as const)('preserves %s rather than inventing zero data', (status) => {
    const { source, facts } = input()
    const availability = status === 'loading' ? { status } : status === 'unavailable' ? { status, error: 'Denied' }
      : { status, error: 'Denied', asOf: now - 1000, value: projectSavedFacts(facts, now - 1000) }
    const context = projectContext(availability, { status: 'unavailable', error: 'Denied' }, source.getLive(), 'read', now)
    expect(context.saved).toEqual(availability)
    expect(context.selection.currentTask).toEqual({ status: 'unavailable', error: 'Denied' })
  })
  it('excludes future events and has deterministic identity ties', () => {
    const { facts } = input()
    const record = facts.sessions[0]
    const saved = projectSavedFacts({ ...facts, sessions: [{ ...record, id: 'z' }, { ...record, id: 'a' },
      { ...record, id: 'future', endedAt: now + 1 }] }, now)
    expect(saved.lastFocus?.id).toBe('a')
  })
  it('does not mutate inputs or expose records/service objects in output', () => {
    const { source, facts } = input()
    const copy = structuredClone(facts)
    Object.freeze(facts.tasks); Object.freeze(facts.sessions); Object.freeze(facts)
    const context = projectContext({ status: 'ready', value: projectSavedFacts(facts, now), asOf: now },
      { status: 'ready', value: facts.tasks, asOf: now }, source.getLive(), null, now)
    expect(facts).toEqual(copy)
    const text = JSON.stringify(context)
    for (const key of ['taskEvents', 'schedule', 'settings', 'lazy', 'mood', 'productivity']) expect(text).not.toContain(`"${key}"`)
  })
  it.each([[5, 'night'], [6, 'morning'], [12, 'afternoon'], [18, 'evening'], [22, 'night']] as const)('uses the prototype day-phase boundary at %s', (hour, phase) => {
      const time = new Date(2026, 9, 6, hour).getTime()
      expect(projectContext({ status: 'loading' }, { status: 'loading' }, { status: 'loading' }, null, time).dayPhase).toBe(phase)
    })
})

import { describe, expect, it } from 'vitest'
import { duplicateContext, duplicateSchedule, duplicateTasks, saveTaskDraft } from './taskDuplicates'
import { createTaskService } from './taskService'
import { createDefaultData } from '../../storage/storage'
import type { AppStorage } from '../../storage/storage'
import type { Task, TaskInput } from '../../domain/task'

const today = '2026-10-06'
const original: Task = { id: 'original', title: 'Read CSAPP', content: null, categoryId: null,
  schedule: { kind: 'date', date: '2026-10-07', timeRange: { start: '14:00', end: '16:00' } },
  status: 'open', createdAt: 0, completedAt: null, droppedAt: null }
function fixture(tasks: Task[] = [original]) {
  let data = { ...createDefaultData(), tasks }, writes = 0
  const storage: AppStorage = { load: () => ({ status: 'ready', data }), save(next) { data = next; writes++; return { status: 'saved' } } }
  const service = createTaskService(storage, () => 1000, () => 'created', () => 'event')
  return { service, data: () => data, writes: () => writes }
}
describe('advisory duplicate Task creation', () => {
  it.each(['Read CSAPP', '  Read CSAPP  '])('matches open titles using only surrounding whitespace trimming: %s', (title) => {
    expect(duplicateTasks([original], title)).toEqual([original])
  })
  it.each(['completed', 'dropped'] as const)('ignores %s tasks', (status) => {
    expect(duplicateTasks([{ ...original, status }], original.title)).toEqual([])
  })
  it.each(['read csapp', 'READ CSAPP', 'Read CSAPP Chapter 3', 'Read CSAPP again', 'Read  CSAPP', '', 'CSAPP'])('does not match a nonidentical title: %s', (title) => {
    expect(duplicateTasks([original], title)).toEqual([])
  })
  it('removes the hint match when the draft title changes away', () => {
    expect(duplicateTasks([original], 'Read CSAPP')).toHaveLength(1)
    expect(duplicateTasks([original], 'Read TCP/IP')).toHaveLength(0)
  })
  it('keeps single and multiple schedule context compact and selects the nearest date', () => {
    expect(duplicateContext([original], today)).toBe('Tomorrow, 14:00–16:00')
    const later = { ...original, id: 'later', schedule: { kind: 'date' as const, date: '2026-10-20', timeRange: null } }
    const unscheduled = { ...original, id: 'unscheduled', schedule: { kind: 'unscheduled' as const } }
    expect(duplicateContext([later, unscheduled, original], today)).toBe('3 tasks with this title · Nearest: Tomorrow, 14:00–16:00')
    expect(duplicateContext([unscheduled], today)).toBe('Unscheduled')
    expect(duplicateSchedule({ kind: 'dateRange', startDate: today, endDate: '2026-10-07' }, today)).toBe('Today – Tomorrow')
  })
  it('confirmation makes no write and leaves the whole draft available when returning to editing', () => {
    const f = fixture()
    const input: TaskInput = { title: ' Read CSAPP ', content: 'Keep this draft', categoryId: null,
      schedule: { kind: 'dateRange', startDate: '2026-10-08', endDate: '2026-10-09' } }
    const before = structuredClone(input)
    expect(saveTaskDraft(null, input, f.service)).toMatchObject({ confirmation: true })
    expect(f.writes()).toBe(0)
    expect(input).toEqual(before)
    expect(f.data().tasks).toEqual([original])
  })
  it('Create Anyway uses normal validated creation with the complete draft', () => {
    const f = fixture()
    const input: TaskInput = { title: ' Read CSAPP ', content: 'Draft content', categoryId: null, schedule: original.schedule }
    expect(saveTaskDraft(null, input, f.service)).toMatchObject({ confirmation: true })
    expect(saveTaskDraft(null, input, f.service, undefined, true)).toEqual({ ok: true, id: 'created' })
    expect(f.writes()).toBe(1)
    expect(f.data().tasks[1]).toMatchObject({ title: 'Read CSAPP', content: input.content, schedule: input.schedule, status: 'open' })
    expect(f.data().taskEvents).toEqual([])
  })
  it('ordinary Task editing bypasses the creation warning', () => {
    const other = { ...original, id: 'other', title: 'Other task' }, f = fixture([original, other])
    expect(saveTaskDraft(other, { title: original.title, content: 'Edited', categoryId: null, schedule: other.schedule }, f.service))
      .toEqual({ ok: true, id: 'other' })
    expect(f.data().tasks[1].title).toBe(original.title)
  })
  it('checks the current service snapshot rather than a stale hint', () => {
    const f = fixture([])
    f.service.create({ title: original.title, content: null, categoryId: null, schedule: { kind: 'unscheduled' } })
    expect(saveTaskDraft(null, { title: original.title, content: null, categoryId: null, schedule: original.schedule }, f.service))
      .toMatchObject({ confirmation: true })
    expect(f.writes()).toBe(1)
  })
})

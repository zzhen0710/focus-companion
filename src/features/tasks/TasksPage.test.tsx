import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TasksPage from './TasksPage'
import { createTaskService } from './taskService'
import { createDefaultData } from '../../storage/storage'
import { openTaskEditor } from '../../app/toolPresentation'

describe('basic Tasks workspace presentation', () => {
  it('reuses the application draft on card remount and removes the editor when the owner clears it', () => {
    const data = createDefaultData()
    const service = createTaskService({ load: () => ({ status: 'ready', data }), save: () => ({ status: 'saved' }) })
    const editor = openTaskEditor(null)
    editor.draft.title = 'Keep this draft'
    const page = (value: typeof editor | null) => renderToStaticMarkup(<TasksPage snapshot={service.getSnapshot()}
      service={service} now={0} editor={value} onEditor={() => {}} />)
    expect(page(editor)).toContain('value="Keep this draft"')
    expect(page(null)).not.toContain('aria-label="New task"')
    expect(page(editor)).toContain('value="Keep this draft"')
    expect(page(editor)).not.toContain('Duplicate task confirmation')
    expect(page(editor)).not.toContain('Confirm deletion')
  })
  it('renders an externally retained draft and blocks a disappeared Task without discarding values', () => {
    const data = createDefaultData()
    const service = createTaskService({ load: () => ({ status: 'ready', data }), save: () => ({ status: 'saved' }) })
    const editor = openTaskEditor({ id: 'gone', title: 'Original', content: null, categoryId: null,
      schedule: { kind: 'unscheduled' }, createdAt: 0, status: 'open', completedAt: null, droppedAt: null })
    editor.draft.title = 'Unsaved draft'
    const html = renderToStaticMarkup(<TasksPage snapshot={service.getSnapshot()} service={service} now={0} editor={editor} onEditor={() => {}} />)
    expect(html).toContain('Your draft is kept'); expect(html).toContain('value="Unsaved draft"')
    expect(html).toContain('<fieldset disabled="">')
    expect(data.tasks).toEqual([])
  })
  it('shows Status, exposes only the approved options, and initially lists only open work', () => {
    const data = createDefaultData()
    data.tasks = (['open', 'completed', 'dropped'] as const).map((status) => ({ id: status, title: `${status} work`, status,
      content: null, categoryId: null, schedule: { kind: 'unscheduled' }, createdAt: 0, completedAt: null, droppedAt: null }))
    const service = createTaskService({ load: () => ({ status: 'ready', data }), save: () => ({ status: 'saved' }) })
    const html = renderToStaticMarkup(<TasksPage snapshot={service.getSnapshot()} service={service} now={0} />)
    expect(html).toContain('<label>Status<select')
    expect(html).not.toContain('<label>Completion')
    const options = [...html.matchAll(/<option[^>]*>([^<]+)<\/option>/g)].map((match) => match[1])
    expect(options).toEqual(['All dates', 'Today', 'Unscheduled', 'All tasks', 'Open', 'Completed', 'Dropped'])
    expect(html).toContain('<option value="all" selected="">All dates')
    expect(html).toContain('<option value="open" selected="">Open')
    expect(html).toContain('>open work</h2>')
    expect(html).not.toContain('>completed work</h2>')
    expect(html).not.toContain('>dropped work</h2>')
  })
})

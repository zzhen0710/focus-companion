import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TasksPage from './TasksPage'
import { createTaskService } from './taskService'
import { createDefaultData } from '../../storage/storage'

describe('basic Tasks workspace presentation', () => {
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
    expect(html).toContain('<h2>open work</h2>')
    expect(html).not.toContain('<h2>completed work</h2>')
    expect(html).not.toContain('<h2>dropped work</h2>')
  })
})

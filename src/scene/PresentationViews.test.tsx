import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import sceneStyles from './MainScene.css?raw'
import CompactTools from './CompactTools'
import TasksPage from '../features/tasks/TasksPage'
import TaskForm from '../features/tasks/TaskForm'
import FocusPage from '../features/focus/FocusPage'
import HistoryView from '../features/history/HistoryView'
import InsightsView from '../features/insights/InsightsView'
import DailyReviewPanel from '../features/review/DailyReviewPanel'
import { createDefaultData } from '../storage/storage'
import { createTimerController } from '../features/focus/timerController'
import { createTaskService } from '../features/tasks/taskService'
import { createReviewService } from '../features/review/reviewService'
import { createHistoryService } from '../features/history/historyService'
import { queryInsights } from '../domain/insights'
import { localCalendarContext } from '../domain/calendarWindows'
import { openTaskEditor } from '../app/toolPresentation'
import { emptyWorkspace, transitionWorkspace } from './workspace'
import { selectedPage } from './pageSelection'

function fixture() {
  let data = createDefaultData(), now = new Date(2026, 9, 6, 12).getTime(), writes = 0
  data.tasks = Array.from({ length: 16 }, (_, i) => ({ id: `task-${i}`, title: `Work ${i}`, content: 'Long notes', categoryId: null,
    status: 'open', schedule: { kind: 'date', date: '2026-10-05', timeRange: null }, createdAt: now, completedAt: null, droppedAt: null }))
  const storage = { load: () => ({ status: 'ready' as const, data }), save: (next: typeof data) => { data = next; writes++; return { status: 'saved' as const } } }
  const controller = createTimerController(storage, () => now, () => 'period')
  controller.start('task-0'); now += data.settings.focusDurationSeconds * 1000; controller.tick()
  const tasks = createTaskService(storage, () => now)
  for (let i = 0; i < 8; i++) { now++; tasks.setCompleted(`task-${i}`, true) }
  const review = createReviewService(storage, () => now), history = createHistoryService(storage, () => now)
  const summary = queryInsights(data, 'today', localCalendarContext(now))
  const compact = (tool: 'focus' | 'tasks' | 'review' | 'history' | 'insights') => renderToStaticMarkup(<CompactTools tool={tool}
    timer={controller.getSnapshot()} controller={controller} tasks={tasks.getSnapshot()} review={review.getSnapshot()}
    history={history.getSnapshot()} insights={summary} error={null} onPromote={() => {}} onRetry={() => {}} />)
  return { controller, tasks, review, history, summary, compact, data: () => data, writes: () => writes, now }
}
describe('intentional Primary and Compact content', () => {
  it('renders reduced Focus controls rather than a scaled full workflow', () => {
    const f = fixture(); f.controller.start()
    expect(f.compact('focus')).toContain('Pause')
    expect(f.compact('focus')).not.toContain('Reset')
    expect(f.compact('focus')).not.toContain('Save durations')
    const full = renderToStaticMarkup(<FocusPage snapshot={f.controller.getSnapshot()} controller={f.controller} tasks={f.data().tasks} />)
    expect(full).toContain('Reset'); expect(full).toContain('Period mode')
  })
  it('shows one actionable Task and separates editing fields, preserving drafts through slot movement', () => {
    const f = fixture(), editor = openTaskEditor(f.data().tasks[8])
    editor.draft.content = 'Unsaved notes'; editor.formView = 'content'
    let state = transitionWorkspace(emptyWorkspace(), { type: 'activate', tool: 'tasks' })
    state = transitionWorkspace(state, { type: 'activate', tool: 'insights' })
    state = transitionWorkspace(state, { type: 'promote', tool: 'insights' })
    state = transitionWorkspace(state, { type: 'promote', tool: 'tasks' })
    expect(state.slots.primary).toBe('tasks')
    const full = renderToStaticMarkup(<TasksPage snapshot={f.tasks.getSnapshot()} service={f.tasks} now={f.now} focused />)
    expect(full.match(/class="task-card"/g)).toHaveLength(1)
    expect(full).toContain('Next tasks'); expect(full).toContain('Edit Work 8')
    const form = renderToStaticMarkup(<TaskForm focused view={editor.formView} task={editor.task} draft={editor.draft}
      categories={[]} service={f.tasks} today="2026-10-06" disabled={false} onClose={() => {}} />)
    expect(form).toContain('Unsaved notes'); expect(form).not.toContain('type="date"'); expect(form).not.toContain('Title<input')
    expect(f.compact('tasks')).not.toContain('Edit Work'); expect(f.compact('tasks')).not.toContain('Delete')
  })
  it('renders compact Review without any workflow entry/settlement/write, even with eligible work', () => {
    const f = fixture(), before = JSON.stringify(f.data()), writes = f.writes()
    expect(f.compact('review')).toContain('8 pending'); expect(f.compact('review')).not.toContain('Complete Work')
    expect(f.data().activeReview).toBeNull(); expect(f.writes()).toBe(writes); expect(JSON.stringify(f.data())).toBe(before)
    f.review.open()
    const full = renderToStaticMarkup(<DailyReviewPanel snapshot={f.review.getSnapshot()} service={f.review} />)
    expect(full).toContain('Complete Work 8'); expect(full).not.toContain('Complete Work 9')
    expect(full).toContain('Move Work 8'); expect(full).toContain('Drop Work 8')
  })
  it('subdivides History into one selected recorded entry without changing history', () => {
    const f = fixture(), snapshot = f.history.getSnapshot(), before = JSON.stringify(snapshot.groups)
    const full = renderToStaticMarkup(<HistoryView focused snapshot={snapshot} period="all" onPeriodChange={() => {}} index={2} />)
    expect(full.match(/class="history-item"/g)).toHaveLength(1)
    expect(full).toContain('Next history entries'); expect(f.compact('history')).not.toContain('Next history')
    expect(JSON.stringify(snapshot.groups)).toBe(before)
    expect(selectedPage(50, 2)).toBe(1); expect(selectedPage(1, 0)).toBe(0)
  })
  it('selects one coherent Insights metric group or paginated trend/task group, with explicit nouns', () => {
    const f = fixture(), render = (view: 'focus' | 'tasks' | 'review' | 'trend' | 'taskFocus') => renderToStaticMarkup(<InsightsView
      focused view={view} period="today" onPeriodChange={() => {}} summary={f.summary} error={null} onRetry={() => {}} />)
    expect(render('focus')).toContain('Completed sessions'); expect(render('focus')).not.toContain('insights-tasks')
    expect(render('tasks')).toContain('Task completions'); expect(render('tasks')).not.toContain('insights-focus')
    expect(render('trend').match(/<li(?:>| )/g)).toHaveLength(1); expect(render('taskFocus').match(/<li(?:>| )/g)).toHaveLength(1)
    expect(f.compact('insights')).toContain('Task completions'); expect(f.compact('insights')).not.toContain('Completion rate')
    expect(f.summary.tasks.activity.completions).toBe(8); expect(f.summary.focus.completedCount).toBe(1)
  })
  it('does not define internal vertical scrolling in the production functional surfaces', () => {
    const css = sceneStyles
    expect(css).not.toMatch(/overflow(?:-y)?:\s*(?:auto|scroll)/)
    expect(css).not.toContain('scene-card-content')
  })
})

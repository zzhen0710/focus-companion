import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import FocusPage from '../features/focus/FocusPage'
import TasksPage from '../features/tasks/TasksPage'
import DailyReviewPanel from '../features/review/DailyReviewPanel'
import HistoryPage from '../features/history/HistoryPage'
import InsightsPage from '../features/insights/InsightsPage'
import { useDailyReview } from '../features/review/useDailyReview'
import { useFocusTimer } from '../features/focus/useFocusTimer'
import { useTasks } from '../features/tasks/useTasks'
import { historyService, insightsService, loadExperienceFacts, retryStorage } from './services'
import { useApplicationReads } from './useApplicationReads'
import { createSceneNavigation } from './sceneNavigation'
import { createProductionBridge } from '../experience/productionBridge'
import { companionMessage, toolLabels } from '../scene/scenePresentation'
import MainScene from '../scene/MainScene'
import CompactTools from '../scene/CompactTools'
import { queryInsights } from '../domain/insights'
import type { TaskEditor, DurationDraft } from './toolPresentation'
import type { HistoryPeriod, InsightPeriod } from '../domain/calendarWindows'
import './App.css'

/** Stable application composition. Tools never bootstrap application lifecycles. */
export default function App() {
  const { snapshot, controller } = useFocusTimer()
  const { snapshot: tasks, service } = useTasks()
  const safe = !!snapshot.data && !snapshot.error
  const review = useDailyReview(snapshot.now, safe)
  useApplicationReads()
  const history = useSyncExternalStore(historyService.subscribe, historyService.getSnapshot)
  const insights = useSyncExternalStore(insightsService.subscribe, insightsService.getSnapshot)
  const [navigation] = useState(() => createSceneNavigation(window))
  const route = useSyncExternalStore(navigation.subscribe, navigation.getSnapshot)
  const [bridge] = useState(() => createProductionBridge(loadExperienceFacts, controller, insightsService))
  const experience = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot)
  const [selectedTask, setSelectedTask] = useState('')
  const [durations, setDurations] = useState<DurationDraft | null>(null)
  const [taskEditor, setTaskEditor] = useState<TaskEditor | null>(null)
  const [reviewEditor, setReviewEditor] = useState<TaskEditor | null>(null)
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('all')
  const [insightPeriod, setInsightPeriod] = useState<InsightPeriod>('today')
  const [taskIndex, setTaskIndex] = useState(0)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [focusView, setFocusView] = useState<'timer' | 'durations'>('timer')
  const [insightView, setInsightView] = useState<'focus' | 'tasks' | 'review' | 'trend' | 'taskFocus'>('focus')
  const [insightIndex, setInsightIndex] = useState(0)
  const [messageCollapsed, setMessageCollapsed] = useState(false)
  const [decisionActive, setDecisionActive] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible')
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 900px), (max-height: 700px)').matches)
  const workspace = route.workspace, active = workspace.slots.primary
  const compactInsights = useMemo(() => insights.facts ? queryInsights(insights.facts, insightPeriod, insights.context) : null, [insights, insightPeriod])
  const saved = experience.context.saved
  const contextError = saved.status === 'stale' || saved.status === 'unavailable' ? saved.error : null
  const error = snapshot.error ?? tasks.error ?? review.snapshot.error ?? history.error ?? insights.error ?? contextError

  useEffect(() => navigation.attach(), [navigation])
  useEffect(() => bridge.attach(), [bridge])
  useEffect(() => { bridge.selectTask(selectedTask || null) }, [bridge, selectedTask])
  useEffect(() => {
    const observe = () => {
      const state = navigation.getSnapshot().workspace
      bridge.setAttention({ visible: pageVisible && !messageCollapsed && !narrow, decisionActive,
        reviewOpen: state.slots.primary === 'review', blockingError: !!error })
    }
    observe()
    return navigation.subscribe(observe)
  }, [bridge, navigation, pageVisible, decisionActive, error, narrow, messageCollapsed])
  useEffect(() => {
    const visible = () => setPageVisible(document.visibilityState === 'visible')
    const media = window.matchMedia('(max-width: 900px), (max-height: 700px)')
    const resize = () => setNarrow(media.matches)
    document.addEventListener('visibilitychange', visible); media.addEventListener('change', resize)
    return () => { document.removeEventListener('visibilitychange', visible); media.removeEventListener('change', resize) }
  }, [])
  useEffect(() => {
    if (active === 'review' && safe) review.service.open()
  }, [active, safe, review.service])
  useEffect(() => { document.title = `${active ? toolLabels[active] + ' · ' : ''}Focus Companion` }, [active])

  function retry() {
    retryStorage()
    bridge.refresh()
    if (active === 'review' && controller.getSnapshot().data && !controller.getSnapshot().error) review.service.open()
  }
  const content = active === 'focus' ? <FocusPage snapshot={snapshot} controller={controller} tasks={tasks.data?.tasks ?? []}
    selectedTask={selectedTask} onSelection={setSelectedTask} durations={durations} onDurations={setDurations} onDecisionChange={setDecisionActive} view={focusView} onView={setFocusView} />
    : active === 'tasks' ? <TasksPage snapshot={tasks} service={service} now={snapshot.now} editor={taskEditor} onEditor={setTaskEditor} onDecisionChange={setDecisionActive} focused index={taskIndex} onIndex={setTaskIndex} />
      : active === 'review' ? <DailyReviewPanel snapshot={review.snapshot} service={review.service} editor={reviewEditor} onEditor={setReviewEditor} index={reviewIndex} onIndex={setReviewIndex} />
        : active === 'history' ? <HistoryPage period={historyPeriod} onPeriodChange={setHistoryPeriod} focused index={historyIndex} onIndex={setHistoryIndex} />
          : active === 'insights' ? <InsightsPage period={insightPeriod} onPeriodChange={setInsightPeriod} focused view={insightView} onView={setInsightView} index={insightIndex} onIndex={setInsightIndex} /> : null
  return <MainScene navigation={route} intent={experience.intent} error={error}
    pendingReview={saved.status === 'ready' ? saved.value.review.remainingCount : null}
    primary={content} compact={(tool) => <CompactTools tool={tool} timer={snapshot} controller={controller} tasks={tasks}
      review={review.snapshot} history={history} insights={compactInsights} error={error}
      onRetry={retry} onPromote={() => navigation.dispatch({ type: 'promote', tool })} />}
    message={companionMessage(experience.intent, experience.context, error, narrow || decisionActive)}
    messageCollapsed={messageCollapsed} onMessageToggle={() => setMessageCollapsed((value) => !value)}
    onAction={navigation.dispatch} onRetry={retry} />
}

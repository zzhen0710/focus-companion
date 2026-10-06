import { useEffect, useSyncExternalStore } from 'react'
import FocusPage from '../features/focus/FocusPage'
import TasksPage from '../features/tasks/TasksPage'
import InsightsPage from '../features/insights/InsightsPage'
import ProfilePage from '../features/profile/ProfilePage'
import HistoryPage from '../features/history/HistoryPage'
import DailyReviewPanel from '../features/review/DailyReviewPanel'
import { useDailyReview } from '../features/review/useDailyReview'
import { isReviewEligible } from '../domain/dailyReview'
import { useFocusTimer } from '../features/focus/useFocusTimer'
import { useTasks } from '../features/tasks/useTasks'
import { retryStorage } from './services'
import './App.css'

const areas = [
  { path: '#/focus', label: 'Focus', Page: null },
  { path: '#/tasks', label: 'Tasks', Page: null },
  { path: '#/history', label: 'History', Page: HistoryPage },
  { path: '#/insights', label: 'Insights', Page: InsightsPage },
  { path: '#/profile', label: 'Profile', Page: ProfilePage },
]

function currentArea() {
  return areas.find((area) => area.path === window.location.hash) ?? areas[0]
}

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export default function App() {
  const area = useSyncExternalStore(subscribeToNavigation, currentArea)
  const { snapshot, controller } = useFocusTimer()
  const { snapshot: tasks, service } = useTasks()
  const review = useDailyReview(snapshot.now, !!snapshot.data && !snapshot.error)
  const pendingReview = review.snapshot.data?.tasks.filter((task) => isReviewEligible(task, review.snapshot.today)).length ?? 0

  useEffect(() => {
    if (window.location.hash !== area.path) {
      window.history.replaceState(null, '', area.path)
    }
    document.title = `${area.label} · Focus Companion`
  }, [area])

  const Page = area.Page

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Skip to content</a>
      <header className="app-header">
        <div>
          <p className="brand">Focus Companion</p>
          <p className="brand-note">Built for accountability, not attention.</p>
        </div>
        <span className="version-label">v0.5 · Insights Core</span>
      </header>
      <nav className="primary-nav" aria-label="Main navigation">
        {areas.map(({ path, label }) => (
          <a key={path} href={path} aria-current={area.path === path ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <main id="main-content" tabIndex={-1}>
        {(snapshot.error || tasks.error || review.snapshot.error) && <div className="storage-message">
          <p role="status">{snapshot.error ?? tasks.error ?? review.snapshot.error}</p>
          <button type="button" onClick={retryStorage}>Retry saving / loading</button>
        </div>}
        {pendingReview > 0 && <button type="button" onClick={review.service.open}>Review pending work ({pendingReview})</button>}
        <DailyReviewPanel snapshot={review.snapshot} service={review.service} />
        {area.path === '#/tasks' ? <TasksPage snapshot={tasks} service={service} now={snapshot.now} />
          : Page ? <Page /> : <FocusPage snapshot={snapshot} controller={controller} tasks={tasks.data?.tasks ?? []} />}
      </main>
      <footer className="app-footer">A quiet space for your work.</footer>
    </div>
  )
}

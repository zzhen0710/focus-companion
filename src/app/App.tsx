import { useEffect, useSyncExternalStore } from 'react'
import FocusPage from '../features/focus/FocusPage'
import TasksPage from '../features/tasks/TasksPage'
import InsightsPage from '../features/insights/InsightsPage'
import ProfilePage from '../features/profile/ProfilePage'
import { useFocusTimer } from '../features/focus/useFocusTimer'
import './App.css'

const areas = [
  { path: '#/focus', label: 'Focus', Page: null },
  { path: '#/tasks', label: 'Tasks', Page: TasksPage },
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
        <span className="version-label">v0.2 · Focus Timer</span>
      </header>
      <nav className="primary-nav" aria-label="Main navigation">
        {areas.map(({ path, label }) => (
          <a key={path} href={path} aria-current={area.path === path ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <main id="main-content" tabIndex={-1}>
        {snapshot.error && <div className="storage-message">
          <p role="status">{snapshot.error}</p>
          <button type="button" onClick={controller.retry}>Retry saving / loading</button>
        </div>}
        {Page ? <Page /> : <FocusPage snapshot={snapshot} controller={controller} />}
      </main>
      <footer className="app-footer">A quiet space for your work.</footer>
    </div>
  )
}

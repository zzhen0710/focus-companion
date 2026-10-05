import { useEffect, useSyncExternalStore } from 'react'
import FocusPage from '../features/focus/FocusPage'
import TasksPage from '../features/tasks/TasksPage'
import InsightsPage from '../features/insights/InsightsPage'
import ProfilePage from '../features/profile/ProfilePage'
import { createLocalStorageAdapter } from '../storage/localStorageAdapter'
import { createDefaultData } from '../storage/storage'
import './App.css'

const areas = [
  { path: '#/focus', label: 'Focus', Page: FocusPage },
  { path: '#/tasks', label: 'Tasks', Page: TasksPage },
  { path: '#/insights', label: 'Insights', Page: InsightsPage },
  { path: '#/profile', label: 'Profile', Page: ProfilePage },
]

function currentArea() {
  return areas.find((area) => area.path === window.location.hash) ?? areas[0]
}

const storage = createLocalStorageAdapter()

function initializeStorage(): string | null {
  const result = storage.load()
  switch (result.status) {
    case 'ready': return null
    case 'missing':
      return storage.save(createDefaultData()).status === 'saved'
        ? null : 'Local data could not be saved. The application shell is still available.'
    case 'invalid':
      return 'Stored data could not be read. It has been left untouched.'
    case 'unsupported':
      return 'Stored data uses an unsupported version. It has been left untouched.'
    case 'unavailable':
      return 'Local storage is unavailable. The application shell is still available.'
  }
}

// Bootstrap once, outside React render; StrictMode must not repeat storage writes.
const storageMessage = initializeStorage()

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export default function App() {
  const area = useSyncExternalStore(subscribeToNavigation, currentArea)

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
        <span className="version-label">v0.1 · Foundation</span>
      </header>
      <nav className="primary-nav" aria-label="Main navigation">
        {areas.map(({ path, label }) => (
          <a key={path} href={path} aria-current={area.path === path ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <main id="main-content" tabIndex={-1}>
        {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}
        <Page />
      </main>
      <footer className="app-footer">A quiet space for your work.</footer>
    </div>
  )
}

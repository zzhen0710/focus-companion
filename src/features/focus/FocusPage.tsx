import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Settings } from '../../domain/settings'
import { modeLabels, remainingMs } from '../../domain/timer'
import type { TimerMode } from '../../domain/timer'
import type { TimerController, TimerSnapshot } from './timerController'
import './FocusPage.css'

const durationFields = [
  { key: 'focusDurationSeconds', label: 'Focus' },
  { key: 'shortBreakDurationSeconds', label: 'Short break' },
  { key: 'longBreakDurationSeconds', label: 'Long break' },
] as const

function DurationSettings({ settings, disabled, controller }: {
  settings: Settings; disabled: boolean; controller: TimerController
}) {
  const [draft, setDraft] = useState(() => ({
    focusDurationSeconds: String(settings.focusDurationSeconds / 60),
    shortBreakDurationSeconds: String(settings.shortBreakDurationSeconds / 60),
    longBreakDurationSeconds: String(settings.longBreakDurationSeconds / 60),
  }))
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const minutes = durationFields.map(({ key }) => Number(draft[key]))
    if (!minutes.every((value) => Number.isInteger(value) && value >= 1 && value <= 180)) {
      setMessage('Use whole minutes between 1 and 180 for each duration.')
      return
    }
    const saved = controller.saveSettings({
      focusDurationSeconds: minutes[0] * 60,
      shortBreakDurationSeconds: minutes[1] * 60,
      longBreakDurationSeconds: minutes[2] * 60,
    })
    setMessage(saved ? 'Durations saved for your next period.' : 'Durations were not saved.')
  }

  return (
    <form className="duration-settings" onSubmit={submit} noValidate>
      <fieldset disabled={disabled}>
        <legend>Period durations</legend>
        <p id="duration-help">Whole minutes, 1–180. Available when the timer is idle or completed.</p>
        <div className="duration-fields">
          {durationFields.map(({ key, label }) => <label key={key}>
            {label} <span className="unit-label">(minutes)</span>
            <input type="number" min="1" max="180" step="1" required value={draft[key]}
              aria-describedby="duration-help duration-message"
              onChange={(event) => {
                setDraft({ ...draft, [key]: event.target.value })
                setMessage('')
              }} />
          </label>)}
        </div>
        <button type="submit">Save durations</button>
      </fieldset>
      <p id="duration-message" className="settings-message" role="status">{message}</p>
    </form>
  )
}

export default function FocusPage({ snapshot, controller }: {
  snapshot: TimerSnapshot; controller: TimerController
}) {
  const [confirmReset, setConfirmReset] = useState(false)
  const primaryButton = useRef<HTMLButtonElement>(null)
  const resetButton = useRef<HTMLButtonElement>(null)
  const data = snapshot.data
  if (!data) return <section className="page" aria-labelledby="focus-heading">
    <h1 id="focus-heading">Focus</h1>
    <p className="page-intro">Load local data to begin a focus period.</p>
  </section>

  const { timer, settings } = data
  const active = timer.status === 'running' || timer.status === 'paused'
  const disabled = snapshot.error !== null
  const seconds = Math.ceil(remainingMs(timer, settings, snapshot.now) / 1000)
  const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const action = timer.status === 'running' ? controller.pause
    : timer.status === 'paused' ? controller.resume : controller.start
  const actionLabel = timer.status === 'running' ? 'Pause'
    : timer.status === 'paused' ? 'Resume' : timer.status === 'completed' ? 'Start another period' : 'Start'
  const status = timer.status === 'completed'
    ? `${modeLabels[timer.mode]} complete.${snapshot.pendingCompletion ? ' Saving is pending.' : ' Choose your next period when ready.'}`
    : `${modeLabels[timer.mode]} · ${timer.status === 'idle' ? 'Ready' : timer.status === 'running' ? 'Running' : 'Paused'}`

  function reset() {
    controller.tick()
    const current = controller.getSnapshot().data?.timer
    const unfinished = current?.status === 'running' || current?.status === 'paused'
    if (unfinished && !confirmReset) {
      setConfirmReset(true)
      return
    }
    controller.reset()
    setConfirmReset(false)
    primaryButton.current?.focus()
  }

  return (
    <section className="page" aria-labelledby="focus-heading">
      <p className="eyebrow">Make room for focused work</p>
      <h1 id="focus-heading">One thing at a time.</h1>
      <p className="page-intro">A calm place to return to what matters.</p>
      <div className="timer-card">
        <fieldset className="mode-selector" disabled={active || disabled}>
          <legend>Period mode</legend>
          {(Object.keys(modeLabels) as TimerMode[]).map((mode) => <label key={mode}>
            <input type="radio" name="timer-mode" value={mode} checked={timer.mode === mode}
              onChange={() => controller.selectMode(mode)} />
            {modeLabels[mode]}
          </label>)}
        </fieldset>
        <output className="timer-display" role="timer" aria-live="off" aria-label="Remaining time">{display}</output>
        <p className="timer-status" role="status">{status}</p>
        {timer.status === 'paused' && <p className="timer-note" role="status">
          Paused at saved progress. Time while the page is away is not counted. Resume when ready.
        </p>}
        <div className="timer-controls">
          <button ref={primaryButton} className="primary-button" type="button" disabled={disabled} onClick={() => {
            setConfirmReset(false)
            action()
          }}>{actionLabel}</button>
          <button ref={resetButton} type="button" disabled={disabled || timer.status === 'idle'} onClick={reset}>
            {active && confirmReset ? 'Confirm reset' : 'Reset'}
          </button>
          {active && confirmReset && <button type="button" disabled={disabled} onClick={() => {
            setConfirmReset(false)
            resetButton.current?.focus()
          }}>Keep period</button>}
        </div>
        {active && confirmReset && <p className="timer-note" role="status">
          Abandon this unfinished period? No focus session will be saved.
        </p>}
        <p className="timer-note">Periods start manually. Reset abandons unfinished time.</p>
      </div>
      <DurationSettings settings={settings} disabled={active || disabled} controller={controller} />
    </section>
  )
}

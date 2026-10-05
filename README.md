# Focus Companion

Built for accountability, not attention.

The approved long-term direction is Companion + Environment + Atmosphere,
supported by reliable lightweight productivity tools. A persistent personal
focus scene and quiet virtual companion are future experience stages; they are
not implemented in v0.2. The current pages are a foundation for validating the
productivity core. See PRODUCT.md and ROADMAP.md for the revised staging.

## Current scope: v0.2 — Focus Timer

A local, single-user React + TypeScript + Vite application with a responsive
shell, hash navigation for Focus / Tasks / Insights / Profile, a light visual
foundation, explicit domain types, and browser-local persistence.

Focus includes a timestamp-based timer with Focus, Short break, and Long break
modes; Start, Pause, Resume, and Reset; duration configuration; and completion
feedback. Tasks, Insights, and Profile remain placeholders. There is no task
management, history UI, analytics, editable profile, account, networking, or
social functionality.

## Timer behavior

Choose a mode and press Start. Pause freezes focused time; Resume continues from
the accumulated running time. Reset confirms abandonment of an unfinished
period and creates no session record. Only naturally completed Focus periods
create FocusSession records; breaks do not. There is no Finish early action or
interrupted-session model. The next period always starts manually.

Duration settings accept whole minutes from 1 to 180 while idle or completed.
Each started period captures its duration. A running timer continues across
in-app navigation, background-tab usage, and switching to another application
such as VS Code. Timestamps remain authoritative while the same page instance
survives, including system sleep; natural completion uses the effective deadline.

Running progress is checkpointed at a target interval of five seconds, with
opportunistic lifecycle saves. A new page instance, including refresh or
close/reopen, restores previously Running state as Paused at the latest saved
progress. Time while the old page was absent is not automatically counted:
reopening past the original deadline alone never awards a FocusSession. Press
Resume to continue the remaining period. Existing Completed state is preserved.
Leaving into BFCache pauses the period; returning keeps it paused, using saved
progress conservatively if the departure event was missed. Ordinary background
visibility changes do not pause it.

Final Windows acceptance testing reflected elapsed sleep time after wake:
expired periods could recover as Completed; unexpired periods were observed as
Paused and required Resume. These are observations from the tested environment,
not universal browser guarantees. There is no dedicated sleep detector that
forces every wake to pause. Timestamps measure elapsed time, not proof of work.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).
On Windows PowerShell, if execution policy blocks `npm.ps1`, use `npm.cmd ci`
and `npm.cmd run dev` instead. No execution-policy change is required.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

`npm run preview` serves the production build locally after `npm run build`.
Tests cover live timestamp recovery, conservative new-instance/BFCache recovery,
checkpoints, completion idempotency, storage failures, and v1-to-v2 migration.
Manual v0.2 acceptance covered timer controls, navigation, natural completion,
keyboard access, narrow layouts, conservative refresh/close/reopen recovery,
Resume after recovery, reopening past the original deadline without an incorrect
completion, and real Windows sleep/wake. Sleep observations are described above;
other browsers and lifecycle paths may differ.

## Structure and persistence

- `src/app`: application shell and navigation.
- `src/features`: Focus UI, timer controller and lifecycle handling; the other three area placeholders.
- `src/domain`: domain contracts and pure timer calculations/transitions.
- `src/storage`: storage interface, defaults, localStorage adapter, and tests.
- `src/styles`: CSS tokens and global styles.

The adapter uses the localStorage key `focus-companion:data` with
`schemaVersion: 2`, task/category/session arrays, settings, and timer state.
Defaults remain 1500/300/900 seconds. Valid v1 data is migrated by adding an idle
Focus timer while preserving all existing records and settings. Migration is
saved explicitly; failed writes leave the old document intact. Navigation and
derived statistics are not persisted.

Invalid or unsupported stored data is left untouched and blocks writes. Storage
failures display a message while keeping the shell accessible. Timer mutations
are blocked until Retry succeeds. A failed completion save stays visible and can
be retried with the same record ID. Completion and its record are saved in one
document write. Display updates are not persisted countdown decrements; running
checkpoints save progress periodically. Lifecycle events improve precision but
are not required for conservative cold recovery. Failed cold-recovery writes
keep the timer paused and block Resume until retry succeeds. If a page is lost
before its completion was saved, reopening cannot infer that unsaved completion.
There is no reset-all, import/export, backup, or general migration workflow.

Use one controlling tab. Concurrent tab writes are not atomic or coordinated.
Manual system-clock changes can affect timestamp-derived time; negative deltas
are clamped, but advanced clock-change recovery is not implemented.
Throttling, freezing, abrupt termination, and failed writes can leave stale
checkpoints; conservative recovery may undercount legitimate running time by
more than five seconds. The recovery change reuses schema v2 and adds no dependency.

Runtime assets are served locally, with no external fonts or services. The app
does not include a service worker or guarantee offline reload when its local
server is unavailable.

Product scope and architectural direction are defined in `PRODUCT.md`,
`ROADMAP.md`, and `ARCHITECTURE.md`.

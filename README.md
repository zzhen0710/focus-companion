# Focus Companion

Built for accountability, not attention.

The approved long-term direction is Companion + Environment + Atmosphere,
supported by reliable lightweight productivity tools. A persistent personal
focus scene and quiet virtual companion are future experience stages; they are
not implemented in v0.3. The current pages are a foundation for validating the
productivity core. See PRODUCT.md and ROADMAP.md for the revised staging.

## Current scope: v0.3 — Tasks Core

A local, single-user React + TypeScript + Vite application with a responsive
shell, hash navigation for Focus / Tasks / Insights / Profile, a light visual
foundation, explicit domain types, and browser-local persistence.

Focus includes a timestamp-based timer with Focus, Short break, and Long break
modes; Start, Pause, Resume, and Reset; duration configuration; and completion
feedback. Tasks includes basic local task management and optional Task-to-Focus
binding. Insights and Profile remain placeholders. There is no history UI,
analytics, editable profile, account, networking, or social functionality.

## Tasks behavior

Create, edit, complete, reopen, delete, and move tasks up/down. Completed tasks
remain editable; repeated completion retains the original completion timestamp.
Content is optional plain text. Manual order is the persisted task-array order;
movement controls appear in the unfiltered list.

Schedules are unscheduled, a local date with an optional complete time window,
or an inclusive date range. Dates must be real YYYY-MM-DD dates; times are HH:mm,
with start strictly before end and no overnight windows. Missing endpoints are
rejected. Equal date-range endpoints are allowed. Planned values remain floating
local calendar values across timezone changes. Creation/completion are timestamps.
The UI exposes All dates, Today, and Unscheduled plus completion filters. All
keeps past unfinished tasks accessible. Pure helpers also support Tomorrow,
Monday-based This Week, This Month, and Later (starting after the current month).

Before Start, choose an open task or No task. Start validates the latest stored
task and captures its task/category IDs. Running and Paused periods lock the
target, including after refresh recovery. Task edits or completion do not change
the captured IDs or manipulate the timer. Natural Focus completion records those
IDs; breaks carry no target. An unfinished timer's target cannot be deleted.
Later task deletion leaves historical sessions unchanged. Missing references
have safe fallback labels. Existing categories are selectable when present;
there is no category creation or management UI.

This is an intentionally basic validation UI; v0.3 manual acceptance passed.
There are no recurring tasks, subtasks, reminders, attachments, rich text, audit
log, Daily Review, interrupted sessions, drag/drop, or companion/scene features.

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
checkpoints, completion idempotency, storage failures, Task operations/schedules,
calendar boundaries, captured targets, and v1-to-v2-to-v3 migration.
Manual v0.2 acceptance covered timer controls, navigation, natural completion,
keyboard access, narrow layouts, conservative refresh/close/reopen recovery,
Resume after recovery, reopening past the original deadline without an incorrect
completion, and real Windows sleep/wake. Sleep observations are described above;
other browsers and lifecycle paths may differ.

v0.3 functional manual acceptance passed as reported by the user. The final
deletion-feedback fix was accepted through conceptual review of the implemented
behavior and automated coverage: Running/Paused rejection explains the reason
inside the confirmation area, preserves useful state, and allows deletion after
Reset without removing historical sessions. No new browser retest is claimed
for that final feedback change.

## Structure and persistence

- `src/app`: application shell, navigation, and shared service composition.
- `src/features`: Focus UI/controller/lifecycle, Task UI/service, Insights/Profile placeholders.
- `src/domain`: domain contracts and pure timer, Task, and calendar logic.
- `src/storage`: storage interface, defaults, localStorage adapter, and tests.
- `src/styles`: CSS tokens and global styles.

The adapter uses the localStorage key `focus-companion:data` with
`schemaVersion: 3`, task/category/session arrays, settings, and timer state.
Defaults remain 1500/300/900 seconds. Pure v1 → v2 → v3 migrations add an idle
timer at v2, then nullable Task content, unscheduled schedules, and nullable
captured timer targets at v3. Existing records, array order, completion facts,
settings, and timer timing are preserved. Loading migrations does not write or
recover a timer; the controller applies conservative recovery and saves
explicitly. Failed writes leave the old document intact. Navigation, pre-start
task selection, calendar filters, and derived statistics are not persisted.

A small local Task service validates each mutation against the latest stored
document and publishes success only after saving. Task and timer writes merge
the latest unrelated collections/settings. Failed Task saves retain editor
drafts; Retry reloads storage before another save attempt.

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
more than five seconds. v0.3 extends metadata in schema v3 without changing these
recovery semantics or adding dependencies.

Runtime assets are served locally, with no external fonts or services. The app
does not include a service worker or guarantee offline reload when its local
server is unavailable.

Product scope and architectural direction are defined in `PRODUCT.md`,
`ROADMAP.md`, and `ARCHITECTURE.md`.

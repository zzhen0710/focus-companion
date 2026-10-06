# Focus Companion

Built for accountability, not attention.

The approved long-term direction is Companion + Environment + Atmosphere,
supported by reliable lightweight productivity tools. A persistent personal
focus scene and quiet virtual companion are future experience stages; they are
not implemented in v0.5. The current pages are a foundation for validating the
productivity core. See PRODUCT.md and ROADMAP.md for the revised staging.

v0.1-v0.5 are completed. v0.6 Experience Contracts & Art Direction adds tested
read-only contracts and an isolated fixture prototype; browser acceptance is pending.
See [Experience Contracts](docs/experience-contracts.md) and
[Art Direction](docs/art-direction.md) for approved future boundaries. Production
Main Scene integration remains v0.7, with atmosphere/personalization in v0.8.

## Production scope: v0.5 — Insights Core

A local, single-user React + TypeScript + Vite application with a responsive
shell, hash navigation for Focus / Tasks / History / Insights / Profile, a light visual
foundation, explicit domain types, and browser-local persistence.

Focus includes a timestamp-based timer with Focus, Short break, and Long break
modes; Start, Pause, Resume, and Reset; duration configuration; and completion
feedback. Tasks includes basic local task management and optional Task-to-Focus
binding. History and Daily Review preserve outcomes. Insights adds read-only
factual summaries and a compact seven-day Focus trend. Profile remains a
placeholder. There is no editable profile, account, networking, social, or
Companion functionality. v0.5 and its terminology clarification passed manual
acceptance as reported by the user.

## Tasks behavior

Create, edit, complete, drop, reopen, delete, and move tasks up/down. Lifecycle is
open → completed/dropped → open through Reopen; terminal states cannot change
directly to one another. Completed/dropped tasks remain editable; repeated actions
retain original timestamps and create no duplicate events.
Content is optional plain text. Manual order is the persisted task-array order;
movement controls appear in the unfiltered list.

Schedules are unscheduled, a local date with an optional complete time window,
or an inclusive date range. Dates must be real YYYY-MM-DD dates; times are HH:mm,
with start strictly before end and no overnight windows. Missing endpoints are
rejected. Equal date-range endpoints are allowed. Planned values remain floating
local calendar values across timezone changes. Creation/completion are timestamps.
The UI exposes All dates, Today, and Unscheduled with Status filters All tasks,
Open, Completed, and Dropped. The default is All dates / Open. View and Status
persist independently under `focus-companion:ui:task-view`; invalid/unavailable
preferences safely fall back to that default without blocking application data.
All dates keeps past unfinished tasks accessible. Pure helpers also support Tomorrow,
Monday-based This Week, This Month, and Later (starting after the current month).

Before Start, choose an open task or No task. Start validates the latest stored
task and captures its task/category IDs. Running and Paused periods lock the
target, including after refresh recovery. Task edits or completion do not change
the captured IDs or manipulate the timer. Start also captures the task title;
completed/interrupted records keep it despite later task corrections. Breaks carry
no target. An unfinished timer's target cannot be deleted, with rejection feedback
inside the confirmation. Later task deletion leaves historical sessions/events/reviews unchanged. Missing references
have safe fallback labels. Existing categories are selectable when present;
there is no category creation or management UI.

New-task creation gives an inline hint and local confirmation for an existing
open Task with the same title after trimming surrounding whitespace only.
Comparison is case-sensitive. Back preserves the draft; Create Anyway permits
duplicates through normal validation. Editing never triggers this warning.
No suppression preference or notification framework is included.

This is an intentionally basic validation UI; v0.4 manual acceptance passed.
There are no recurring tasks, subtasks, reminders, attachments, rich text, audit
framework, drag/drop, or companion/scene features.

## History and Daily Review

Immutable Task events record Complete, Drop, Reopen, and genuine schedule changes,
with small title/schedule snapshots. Corrections to title/content/category and
list ordering create no events. History groups FocusSessions, TaskEvents, and
completed Reviews by local occurrence date, newest first with deterministic ties.
Legacy titles remain unknown. History supports All time (default), Today,
This week, and Last 7 days. Filtering preserves chronology and details, writes
nothing, and distinguishes empty history from an empty selected period.

Review collects open date tasks before today and date ranges ending before today.
Unscheduled/current/future/completed/dropped tasks are excluded, including expired
time windows on the current day. A fresh safe app document prompts once; Dismiss
does not resolve work. A visible pending-work button reopens Review. Navigation,
background changes, and ticks do not repeatedly prompt; date changes update eligibility.

A bounded review draft survives reload. Complete records now, Move requires an
explicit changed valid schedule that is no longer overdue (including deliberate
Unscheduled), and Drop preserves the entity. Actual linked events determine the
summary. Outside changes simply remove queued work; an empty draft with no real
review actions is cancelled, otherwise completed. Each action and final summary
metadata save atomically. No reviews are fabricated for missed calendar days.

## Insights

Select Today (default), This week, or Last 7 days. Weeks start Monday; Last 7
days includes today and the preceding six local calendar dates, not 168 fixed
hours. Current windows include only facts at or before the reference time.
Focus uses the local ending date, without splitting cross-midnight sessions.
This is a consistent attribution rule, not a precise allocation of each second.
Timezone changes regroup timestamped facts; floating Task schedules stay fixed.

- Focused is the sum of saved actual durationSeconds from completed and
  interrupted sessions. Completed sessions, Interrupted sessions, and Sessions
  are record counts.
  Completion rate is completed / all sessions; Average session is actual total /
  all sessions. Empty rate/average display an em dash. Valid historical
  zero-duration sessions still count. Live/unsaved timer time and breaks do not.
- Now shows current Open tasks and Overdue tasks, independent of the selected
  historical period. Overdue uses exactly the Daily Review eligibility rule.
- Task activity counts Task completions, Moved, and Dropped operations from
  TaskEvents. Complete -> Reopen -> Complete counts two completions. Older
  versions did not record these events; current Task timestamps cannot fill gaps.
- Review counts completed Review records by completedAt and linked actions by
  their own occurredAt, even while a draft remains active. Review actions are
  subsets of Task activity; cohort size is not a processed-task count. Labels are
  Reviews completed, Task completions through Review, Moved through Review, and
  Dropped through Review.
- Focus · Last 7 days always shows seven ascending daily rows with zero-filled gaps,
  textual durations, outcome counts, and simple CSS bars. Its sum matches the
  same period's Focus total regardless of the selected summary period.
- Task focus groups by captured Task ID, not title. The latest non-null title
  captured at Start within the window labels the group; edits/deletion do not
  replace it with a current name. Unknown historical task and No task remain
  distinct. Results sort by focused seconds descending with stable ID ties.

Task completions and Focus-session outcomes describe different facts. Manually
completing a Task creates a TaskEvent, not a FocusSession. Natural Focus completion
records a completed session without completing the Task. Completing a Task during
Focus, then resetting unfinished Focus, records one Task completion and one
eligible interrupted session, never a duplicate Task completion. Daily/per-Task
Focus outcome rows use explicit session nouns with singular/plural grammar.

Summaries are read-only, not productivity judgments or recommendations. Durations
display to tenths of a second where needed and percentages to whole percent;
queries retain unrounded values. Period choices are not persisted. Read pages
refresh on entry, visible focus/return, relevant storage changes, and once per
minute while visible for date/timezone changes; throttling may delay refresh.
Failed reads show an error rather than fake zero statistics; retained results
are explicitly marked. No Category analytics or Task trend charts are included.

## Timer behavior

Choose a mode and press Start. Pause freezes focused time; Resume continues from
the accumulated running time. Reset confirms abandonment of an unfinished
period. Natural completion records `completed`; explicit unfinished Focus Reset
records `interrupted` only when trustworthy time reaches one full second. Actual
interrupted seconds are floored, clamped to planned duration, and exclude pauses
and unverified closed-page gaps. Zero/subsecond Reset and all Breaks create no
FocusSession. There is no Finish early action. The next period starts manually.

Interrupted Reset and Idle save together. On failure the intent/time is frozen
and controls remain blocked until Retry saves it once. Losing that page cannot
fabricate its unsaved interruption; cold recovery uses saved progress as before.

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

## Isolated v0.6 Main Scene prototype

With `npm run dev` running, open
`http://localhost:5173/prototypes/main-scene/` (use Vite's printed port).
Append `?lab=1` for in-memory scenarios, completion candidates, failed reads,
recovery, and reference-time advancement. The normal `/` entry remains the
production application. No config or package-script change is required.

The separate entry renders one original layered SVG human companion in a daylight study room,
a Show/Hide controls handle, six lightweight launchers, and one fixture panel.
Task draft text survives switching/collapse in memory; destructive confirmation
does not. These panels are interaction/composition samples, not working tools.
Settings is a placeholder. No fixture, draft, reaction, or utility state is saved.
The normal production build excludes this entry and artwork.
The six launchers, rectangular handle, grid, daylight SVG, and card dimensions
describe this prototype only. The approved future production direction in
[Art Direction](docs/art-direction.md) and [Experience Contracts](docs/experience-contracts.md)
supersedes those choices; v0.7 is not implemented.

Pure contracts in `src/experience` distinguish live/pending timer state, committed
facts, selected/captured/current/historical Task identity, and data availability.
The thin read-only coordinator separates live ticks from saved aggregation.
Deterministic rules produce semantic presence, optional acknowledgment, and
optional Review cue without business commands or psychological inference.
Production integration remains v0.7; schema v4 and all business behavior remain
unchanged. See [Experience Contracts](docs/experience-contracts.md) and
[prototype acceptance steps](docs/art-direction.md#browser-acceptance-checklist).

v0.6 automated verification passes 324 tests across 27 files, typecheck, lint,
and production build. Both development entries serve successfully. No enabled
browser-control surface was available during implementation, so visual hierarchy,
real keyboard/focus behavior, responsive/zoom/reduced-motion rendering, browser
storage before/after, and console acceptance are not claimed as verified.

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
calendar boundaries, captured targets/titles, interruption retries, immutable
history, review eligibility/resume/summary, and v1-to-v2-to-v3-to-v4 migration.
v0.5 adds coverage for factual metrics, local-calendar/DST windows, endedAt
attribution, trend sum consistency, captured Task identity, Review subsets,
History filters, read lifecycle, and successful-write refresh with zero query writes.
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

v0.4 History & Daily Review Core and all approved small UX corrections passed
manual acceptance as reported by the user. Its closeout automated suite contained
210 tests across 15 files, including case-sensitive duplicate detection and
isolated Task workspace preferences. That closeout did not claim
new browser, sleep/wake, or storage-denial manual tests.

v0.5 Insights Core, including the Task-versus-Focus terminology clarification,
passed manual acceptance as reported by the user. Final automated verification
passed typecheck, lint, 258 tests across 22 files, production build, and
git diff --check. Closeout changes are documentation only; no new browser,
real sleep/wake, or storage-denial manual testing is claimed by this closeout.

## Structure and persistence

- `src/app`: application shell, navigation, and shared service composition.
- `src/features`: Focus, Tasks, History, Review, Insights, and a Profile placeholder.
- `src/domain`: domain contracts and pure timer, Task, calendar, and Insights queries.
- `src/storage`: storage interface, defaults, localStorage adapter, and tests.
- `src/styles`: CSS tokens and global styles.
- `src/experience`: pure read-only context, utility states, rules, and tests; not wired into production.
- `src/prototypes/main-scene` and `prototypes/main-scene`: isolated development prototype.

The adapter uses the localStorage key `focus-companion:data` with
`schemaVersion: 4`, task/category/session/event/review collections, settings,
timer state, and a nullable active review draft.
Defaults remain 1500/300/900 seconds. Pure v1 → v2 → v3 → v4 migrations add an idle
timer at v2, then nullable Task content, unscheduled schedules, and nullable
captured timer targets at v3; v4 adds lifecycle, completed outcome/planned duration,
unknown title snapshots, and empty historical/review collections. No old Task events,
interrupted records, or Reviews are invented. Existing records, array order, completion facts,
settings, and timer timing are preserved. Loading migrations does not write or
recover a timer; the controller applies conservative recovery and saves
explicitly. Failed writes leave the old document intact. Task View/Status are
presentation preferences in their separate key, not schema v4 fields. Navigation,
pre-start task selection, editor/confirmation state, and derived statistics are
not persisted.

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
more than five seconds. v0.4 extends metadata in schema v4 without changing these
recovery semantics or adding dependencies.

v0.5 keeps schema v4 and its migrations/validation unchanged. Insights receives
only storage load capability and derives all summaries in memory; it never
reconciles timers, settles Reviews, or saves analytics. Existing successful-write
composition refreshes the read snapshots. No new dependency is introduced.

Runtime assets are served locally, with no external fonts or services. The app
does not include a service worker or guarantee offline reload when its local
server is unavailable.

Product scope and architectural direction are defined in `PRODUCT.md`,
`ROADMAP.md`, and `ARCHITECTURE.md`.

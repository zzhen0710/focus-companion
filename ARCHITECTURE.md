# Focus Companion — Architecture

This document defines the architectural direction of Focus Companion.

The goal is to keep the current application simple while preserving clean boundaries for future growth.

> Design for extension. Do not prematurely build the extension.

---

# 1. Current Architecture

During the v0.x and v1.0 stages, Focus Companion is a:

- local
- single-user
- browser-based
- client-side application

There is:

- no backend
- no account system
- no cloud database
- no networking requirement
- no social infrastructure

The application should remain fully usable without Internet access.

The approved delivery direction is Web-first and local-first. Public Web
deployment belongs to v0.9 and does not itself require a backend, accounts,
cloud data, or social services. The current v0.5 app has no offline resource
cache; deployment, asset-loading, and offline delivery details remain work for
their relevant stages, not infrastructure choices made by this document update.

---

# 2. Initial Technology Stack

The initial frontend stack is:

- React
- TypeScript
- Vite
- standard CSS
- browser local persistence

Avoid unnecessary framework layers.

Do not add technologies only because they may become useful later.

In particular, do not introduce yet:

- Next.js
- backend frameworks
- databases
- Docker
- Redis
- WebSocket
- authentication libraries
- global state-management frameworks unless clearly needed
- microservices

Future versions may change the stack when real requirements justify it.

---

# 3. Why React + TypeScript + Vite

Focus Companion is expected to grow beyond a single static page.

The current shell exposes separate functional areas. Long-term these functions
should be lightweight surfaces within a persistent companion scene:

- Focus
- Tasks
- Insights
- Profile
- Settings
- later social features

React provides a clean component model for this growth.

TypeScript provides stronger boundaries for:

- domain models
- persistence
- timer state
- statistics
- future API contracts

Vite keeps local development simple and lightweight.

---

# 4. Architecture Principles

## 4.1 Separate Domain Logic from UI

Important behavior should not live entirely inside React components.

For example:

- timer calculations
- task operations
- focus-session creation
- statistics calculations
- persistence logic

should be separated from visual components when practical.

React components should primarily be responsible for:

- rendering
- user interaction
- composing application behavior

This keeps business logic testable and easier to reuse later.

### Approved evolution: application services and experience

Before experience-heavy stages, build a stable productivity core behind local
TypeScript application/service interfaces. The conceptual direction is:

```text
Experience / Scene / UI
    ↓
Application Services (local TypeScript interfaces)
    ↓
Domain
    ↓
Persistence
```

Focus, Tasks, Review, History, and Insights are potential service boundaries,
introduced only when the corresponding version needs them. These are not HTTP
or backend APIs, and this diagram does not require a framework, new directory
tree, or every interface to be created now. The v0.2 controller and pure timer
functions already provide a useful starting separation. In v0.3,
`src/app/services.ts` composes one storage adapter, the timer controller, and a
small Task service. Timer bootstrap/migration runs before Tasks load. Task
operations (`getSnapshot`, `subscribe`, `reload`, `create`, `update`,
`setCompleted`, `delete`, `move`) validate the latest persisted document and
publish success only after saving. Clock and ID generation are injectable for
tests. No repository framework, event bus, or backend API is introduced.

v0.4 adds small Review and read-only History services. Successful shared storage
writes refresh their snapshots. Task and Review actions reuse pure Task mutation
logic; each writes the latest complete document once, preserving unrelated data.
Review decisions save the Task, TaskEvent, and draft/final Review together.

Experience consumes business state and actions without embedding business
rules. Domain/application code must not depend on specific avatar animation,
room art, music, sound playback, or rendering implementation. For example, the
experience layer may map a focusing state to a studying companion; the domain
does not know that visual representation. Do not introduce placeholder companion
domain types into the productivity core or speculative asset infrastructure.
Rendering technology (2D, Live2D-like, 3D, or another approach), media-storage
technology, exact service contracts, and experience mappings remain undecided.

### Approved pre-v0.6 experience boundary (not implemented)

The completed v0.1-v0.5 core supports the following future read-side direction:

```text
Persisted Facts -> Read-only Insights -> Experience Context
Persisted Facts ----------------------> Experience Context
Live timer / transient selection ------> Experience Context
Experience Context -> Experience Rules -> Expression Intent
Expression Intent -> Companion / Scene / Utility UI / future audio
```

Context is a curated read-only projection, not raw AppData or service objects.
Live timer status/progress and transient Task selection need not pass through
persisted Insights. Preserve committed facts, pending actions, historical
snapshots, live state, and unavailable/stale data distinctly. Failed reads are
not zero activity; unsaved actions are not historical facts. Existing timer
functions remain authoritative, and saved Focus totals retain v0.5 semantics.

Rules arbitrate attention deterministically: at most one primary reaction and
one compatible ambient cue; silence is valid. Stable fact identity, deduplication,
suppression, cooldown, once-per-session behavior, and expiration prevent tick,
checkpoint, reload, and retry publication from becoming repeated reactions.
Initial loading must not replay history, nor should missed cues form a backlog.

Expression Intent describes meaning, not rendering technology. Domain facts
must not directly command presentation or assign emotional judgment to an
interruption. User commands continue through existing application services;
context reads and visual expression do not execute workflow mutations. No LLM /
AI Agent is planned before v1.0; later AI needs separate approval.

Detailed contracts are in [Experience Contracts](docs/experience-contracts.md).
This direction does not introduce code, schema fields, persisted aggregates,
reaction-history records, a repository framework, or an event bus. v0.6 planning
should stabilize only the actual boundaries required by its small prototype.

---

## 4.2 Organize Around Features

Prefer feature-oriented structure over one huge collection of unrelated components.

A possible structure:

```text
src/
├── app/
│   ├── App.tsx
│   └── routes/
│
├── features/
│   ├── focus/
│   ├── tasks/
│   ├── insights/
│   └── profile/
│
├── domain/
│   ├── task.ts
│   ├── focusSession.ts
│   ├── category.ts
│   └── settings.ts
│
├── storage/
│   ├── storage.ts
│   └── localStorageAdapter.ts
│
├── components/
│   └── shared UI components
│
├── styles/
│   ├── tokens.css
│   ├── global.css
│   └── ...
│
└── main.tsx
```

This structure is a direction, not a rigid requirement.

Do not create empty folders merely to match this diagram.

Create modules only when the current version needs them.

---

# 5. Initial Domain Models

The early application should revolve around a small number of explicit domain objects.

---

## Task

Represents something the user intends to work on.

Implemented v0.4 fields:

```text
id
title
content (nullable plain text)
categoryId
schedule
status (open | completed | dropped)
createdAt
completedAt
droppedAt
```

`schedule` is a discriminated union: `{ kind: 'unscheduled' }`,
`{ kind: 'date', date, timeRange: null | { start, end } }`, or
`{ kind: 'dateRange', startDate, endDate }`. Only the active variant is stored.
Real YYYY-MM-DD dates and HH:mm times are validated. Time ranges require both
endpoints, start < end, and no overnight interval; date ranges are inclusive
and allow equal endpoints. These are floating local calendar values, never UTC
planning instants. Pure helpers use UTC calendar components only for deterministic
date arithmetic, avoiding assumptions about local 24-hour days. Query context
comes from the user's local date; week starts Monday. Date ranges match by
inclusive overlap. Later means starting after the current calendar month.

Task array order is manual order. Open tasks may be completed or dropped;
terminal tasks must reopen before entering the other terminal state. Repeating
the same transition is idempotent. Reopen clears both terminal timestamps.
Completed and dropped tasks remain editable. TaskEvents record only completion,
drop, reopen, and actual schedule changes, with small title/schedule snapshots;
ordinary corrections and ordering do not create events. Deleting a Task leaves
all historical records intact. Legacy completion timestamps are preserved during
migration, including unusual combinations, rather than repaired or fabricated.

---

## FocusSession

The implemented record represents a naturally completed Focus period or an
explicit Reset of unfinished Focus with at least one full trustworthy second.
Active period state is held separately in `timer`.

Implemented fields:

```text
id
taskId
categoryId
startedAt
endedAt
durationSeconds
plannedDurationSeconds
outcome (completed | interrupted)
taskTitleSnapshot (nullable)
```

FocusSession is the primary historical unit for time statistics.

Statistics should generally be derived from session records rather than stored as duplicated totals.

## Daily Review and History

Review eligibility is an open Task with a date before today, or a date range
ending before today, using local calendar values. Same-day time ranges do not
become overdue within the day. A persisted activeReview stores a stable ID,
start time, local date, and bounded Task ID cohort. Decisions complete now,
move to a changed valid non-overdue schedule (including deliberate Unscheduled),
or drop. Linked TaskEvents provide derived counts; completed Reviews store no
duplicated totals. Outside resolutions skip candidates without inventing events.
An empty draft finishes only if it has actual Review actions; otherwise it is
discarded. Dismissal is transient and does not resolve work. Safe document entry
prompts once; navigation, ticks, backgrounding, and date changes do not reprompt.

History is a read-only projection of FocusSessions, TaskEvents, and completed
Reviews, ordered chronologically with deterministic ties and grouped by local
date. It does not reconcile timers or write storage. v0.5 adds All time / Today /
This week / Last 7 days filtering with transient selection; this is not a general
audit-log framework.

---

## Category

Represents a way to classify work.

Examples:

- C++
- Algorithms
- English
- Reading

Possible fields:

```text
id
name
createdAt
```

Visual metadata may be added later if required.

---

## Settings

Stores user preferences such as:

```text
focusDuration
shortBreakDuration
longBreakDuration
theme
```

Settings should remain separate from historical focus data.

---

# 6. Stable Identifiers

Domain records should use stable unique IDs.

Do not rely on:

- array indexes
- task titles
- timestamps alone

as permanent identifiers.

Stable IDs will make future synchronization and migration easier.

This does not mean networking should be implemented now.

---

# 7. Time Handling

## Implemented v0.2 timer boundary

The timer has Focus, Short break, and Long break modes with idle, running,
paused, and completed states. Pure functions in `src/domain/timer.ts` derive
elapsed time from accumulated running milliseconds and the current segment's
start timestamp. Paused time is excluded. Background tabs and switching to other
applications do not pause the timer. While the same page instance survives,
Running time includes background delays and system sleep; completion uses the
calculated deadline even when observed later. New periods always start manually.

An application-scoped controller owns persistence and completion reconciliation.
The React hook remains mounted across in-app navigation. Lifecycle binding is
separated into `timerLifecycle.ts`; display ticks and visibility/focus/resume
signals reconcile live timestamps. While Running, the controller checkpoints
verified progress at a target interval of five seconds, with opportunistic
lifecycle saves. A checkpoint moves elapsed time into `accumulatedMs` and resets
`runStartedAt`, preserving the effective deadline. Display ticks are not
persisted countdown decrements. Throttling, freezing, and failed writes may
delay checkpoints beyond five seconds.

On a new page instance, including refresh or close/reopen, persisted Running
state is converted to Paused using only its saved accumulated progress BEFORE
timestamp reconciliation. The old page's absent interval is not automatically
verified focus time; reopening beyond the old deadline alone cannot create a
FocusSession. Resume starts a new running segment for the remaining time, with
the same timer ID and captured duration. Existing Completed state is preserved.
Cold recovery remains conservative across failed reads and save retries; failed
recovery writes retain the paused state in memory and block Resume until saved.
The v0.2 recovery fields remain unchanged in schema v4; no dependency was added.

The v0.3 metadata extension captures nullable task/category IDs when Focus
starts, after checking the latest Task is open. Running/Paused targets cannot
be switched. Edits/completion do not change captured IDs or timing. Recovery,
pause/resume, checkpoints, and natural completion preserve those IDs; the
FocusSession receives them on completion. v0.4 also captures the Task title at
Start; edits never rewrite that snapshot, and legacy titles remain unknown.
Breaks have null targets. Task deletion
is rejected while a Running/Paused timer references it. Later deletion never
rewrites sessions; unresolved references are valid and display fallback labels.

Lifecycle events improve checkpoint precision, not cold-recovery correctness.
The implementation does not rely on beforeunload/unload, a heartbeat timeout,
or any single lifecycle signal to detect closure. `pagehide` attempts to reconcile
live completion or persist Paused at departure. BFCache restoration remains
paused; if departure was missed, `pageshow.persisted` invokes conservative
recovery from persisted progress. Ordinary background visibility changes and
freeze/resume do not pause. This is a best-effort browser lifecycle boundary,
not a guarantee that every browser will deliver every event.

Failed user transitions retain the prior state; failed checkpoints surface an
error and block controls until retry. Failed completion remains visible and
retryable in the surviving page, blocking new periods. If that page is lost
before completion was saved, a new instance must recover saved progress as
paused rather than infer the unsaved completion. Writes read the latest valid
document to preserve unrelated records; paused-recovery retry does not downgrade
an already saved completion or overwrite a different timer identity.

Natural Focus completion saves Completed state and its record together, using
the timer ID to avoid duplicates. In v0.4, explicit unfinished Focus Reset saves
Idle and an interrupted record together when trustworthy elapsed time floors
to at least one second. Zero/subsecond Focus and breaks create no Reset record.
Natural completion takes precedence if the deadline has already passed. A failed
Reset freezes the intended elapsed time and result in the surviving controller,
blocks actions, and retries against the latest document without duplicate history.
Loss of that page does not invent an unsaved interruption. Pause, lifecycle
events, refresh, and conservative recovery never create interrupted records.
Existing history is never removed by Reset. There is no Finish early action.

Final real Windows acceptance testing reflected elapsed wall-clock sleep time
after wake. Expired periods could recover as Completed; unexpired periods were
observed as Paused and required explicit Resume. These observations do not
establish a universal browser guarantee or identify the exact lifecycle path.
There is no OS sleep detector or forced-pause-on-wake action: surviving Running
instances still reconcile timestamps, while cold/BFCache recovery is conservative.

These guarantees target one controlling browser tab. Re-reading storage before
writes preserves the latest unrelated records, but does not provide atomic
coordination between tabs. Conservative recovery can undercount legitimate time
when the latest checkpoint is stale. Advanced wall-clock-change recovery is deferred.

Time is a critical part of Focus Companion and must be treated carefully.

The timer must not rely only on:

```text
remainingSeconds -= 1
```

because browser timers may be delayed when:

- the tab is inactive
- the computer sleeps
- the browser throttles JavaScript

Instead, timer calculations should be based primarily on real timestamps.

Conceptually:

```text
remaining time
=
target end timestamp
-
current timestamp
```

The UI may update visually every second, but timestamps remain the source of truth.

This architecture is required before v0.2 is considered reliable.

---

# 8. Persistence Boundary

Application code should not directly scatter calls to:

```text
localStorage.getItem(...)
localStorage.setItem(...)
```

throughout components.

Persistence should be behind a small storage abstraction.

Conceptually:

```text
Application
    ↓
Storage Interface
    ↓
Local Storage Adapter
```

For the early versions, the implementation may use browser localStorage.

Later it may evolve toward:

```text
IndexedDB
```

or eventually:

```text
Remote API
```

without requiring the entire application to be rewritten.

Do not implement those future adapters yet.

---

# 9. Data Schema Versioning

The implemented v0.4 document uses `schemaVersion: 4` at the existing key
`focus-companion:data`. The adapter validates supported schemas, returning pure
v1 → v2 → v3 → v4 migrations. v1 → v2 adds an idle Focus timer; v2 → v3 adds Task
`content: null`, `schedule: { kind: 'unscheduled' }`, and null task/category
targets to started timers. v3 → v4 maps Task completion booleans to status,
adds nullable droppedAt, and adds empty TaskEvent/Review collections and a null
activeReview. Legacy sessions become completed with planned duration equal to
their stored actual duration and unknown title snapshots; started timers also
receive null title snapshots. No events, Reviews, or interruptions are backfilled.
IDs, order, completion facts, categories, sessions,
settings, and all timer timing information are preserved without mutating input.
Migration loading neither writes nor applies timer recovery. The controller
then applies its conservative recovery and saves explicitly, including migrated
Completed state. Failed writes preserve the old stored document. Invalid data
and unknown versions continue to block writes. There is no general migration
framework or destructive reset fallback.

Persisted application data should include a schema version.

Example concept:

```text
schemaVersion: 1
```

When persistent structures change later, explicit migration logic can be introduced.

The application should avoid silently assuming that all stored data always matches the latest code.

This becomes especially important as Focus Companion is used over months or years.

---

# 10. Derived Data

Avoid storing unnecessary duplicated statistics.

For example, instead of permanently maintaining:

```text
todayTotal
weekTotal
cppTotal
algorithmTotal
```

prefer deriving those values from FocusSession records.

Conceptually:

```text
FocusSession[]
        ↓
analytics functions
        ↓
today total
category distribution
7-day trend
30-day trend
```

This reduces inconsistent data.

---

# 11. Analytics Boundary

Statistics calculations should be independent from chart rendering.

For example:

```text
FocusSession[]
        ↓
analytics logic
        ↓
structured result
        ↓
chart component
```

The chart library should visualize data.

It should not own business logic.

v0.5 uses plain HTML/CSS daily rows and bars; no chart dependency is needed.

## Implemented v0.5 read-only queries

`calendarWindows.ts` defines only Today, Monday-based This week, and Last 7 days
(today plus six preceding local dates). Pure queries receive a reference time
and calendar context; upper dates are exclusive and facts after the reference
instant are excluded. Calendar arithmetic uses date components, not fixed
24-hour days. The current system zone maps timestamps to dates; a zone change
regroups facts without modifying them. All time History preserves all records.

`insights.ts` derives summaries from saved FocusSessions, current Tasks,
TaskEvents, and completed Review records. Focus uses actual durationSeconds,
including both outcomes and valid legacy zero-duration records. With C completed,
I interrupted, N = C + I, and T = sum(durationSeconds), completion rate is C / N
and average duration is T / N; both are null when N is zero. Live/unsaved timer
time, breaks, planned duration, and endedAt - startedAt are not counted.
Whole sessions belong to the endedAt local date, matching History; this is an
attribution convention, not precise cross-day allocation.

Task completions/drops/reschedules count events by occurredAt, including repeated
real operations; Reopen never removes prior facts. Open/Overdue now are separate
current-state counts, with overdue identical to Review eligibility. Review counts
use completedAt; linked actions use their own occurredAt, including persisted
actions in an active draft. Those actions are subsets of Task activity, not
additional activity. Review cohorts and current terminal timestamps do not
manufacture missing historical operations. Older versions have incomplete event
coverage and are not backfilled.

Task completions and Completed sessions / Interrupted sessions are intentionally
different metrics. Manual Task completion creates only a TaskEvent; natural Focus
completion creates a FocusSession without completing the Task. Completing a Task
during Focus and then resetting unfinished Focus creates one Task completion and
one eligible interrupted session, not a completed session or another Task event.
Integration tests assert these boundaries. The trend heading is Focus · Last 7
days; daily/per-Task outcome rows use explicit singular/plural session nouns.

The seven-day trend has seven ascending, zero-filled dates and agrees with the
same window's Focus total. Task Focus groups use taskId, including a separate
No task group. Titles use the latest non-null Start capture within the queried
window (startedAt descending, then session ID ascending); unknown legacy titles
remain Unknown historical task. Current Task names/deletion never rewrite these
labels. Groups sort by actual seconds descending, then Task ID ascending, with
null last on ties.

`insightsService` receives only load capability and exposes getSnapshot,
subscribe, reload, and query(period). It neither saves nor invokes Timer/Review
workflows. Existing successful-write composition refreshes its facts after Review
settlement. Failed reads preserve the last loaded results with an error; an
initial failed read returns no summary rather than fabricated zero metrics.
History and Insights refresh on mount, visible focus/pageshow, visibility return,
relevant storage events, and once per minute while visible. The minute check
eventually updates date/zone context; throttling can delay it. These reads never
participate in Timer correctness or change source data. Period selection is
transient. Schema stays v4 with v1 -> v2 -> v3 -> v4 migration unchanged; no
aggregates, caches, timezone metadata, or UI calculations are persisted.

No Category analytics, generic engine, event bus, background aggregation,
productivity judgment, recommendations, or Companion interpretation is introduced.

---

# 12. UI Architecture

Task workspace View/Status selections are presentation preferences stored under
`focus-companion:ui:task-view`, independently of schema v4 application data.
Supported values are validated; missing/invalid/unavailable preferences fall back
to All dates / Open. Save failures retain the selection in the current document
without blocking durable data. Editors, confirmations, focus, and scroll are not
stored. Future All Active / finite Priority levels / Closed grouping, coarse
priority plus fine manual order, icon controls, drag reordering, and scene Task
surfaces remain design topics; no fields or infrastructure are introduced for them.

The implemented v0.4 shell has hash navigation for:

```text
Focus
Tasks
History
Insights
Profile
```

This shell is a valid temporary foundation, not the final visual hierarchy.
v0.3-v0.5 may use intentionally basic pages to validate behavior and local APIs;
avoid excessive polish for dashboard layouts expected to change from v0.7.

The long-term experience prefers one persistent primary scene with the companion
visually present for most core interactions. Timer, Tasks, History, Review, and
Insights should be lightweight functional surfaces, potentially drawers,
overlays, compact cards, side panels, or contextual controls. Do not require
frequent navigation between themed rooms or a large independent Task Wall.
Exact surfaces and layout remain art/interaction decisions for their roadmap
stages. The first companion release prioritizes one polished default companion
and one polished default environment. Profile/social features remain later scope.

## Approved future presentation lifetimes

One persistent App Shell / Main Scene does not mean one giant React component.
The conceptual children are EnvironmentLayer, CompanionLayer, GlobalUiHandle,
UtilityLaunchers, and one ActivePanel. These components do not exist in v0.5.
Application services and timer lifecycle must survive panel mounting changes.
Routing may remain for compatibility, tests, development, and deep links; the
future route adapter must not replace the scene or duplicate panel-state ownership.
Exact hash/history behavior awaits implementation planning.

Immersive / utility-ready / active-panel state controls presentation only.
Collapse hides the panel and launchers; reveal normally restores launchers only.
Non-destructive drafts generally survive temporary hiding/switching in memory,
without autosave. Destructive confirmations require renewed intent after hiding.
Review's durable cohort remains separate from panel visibility. No presentation
transition may imply Task submission, Review resolution, Focus Pause/Reset, or
confirmation. Detailed interaction and error contracts are in
[Experience Contracts](docs/experience-contracts.md).

Future Settings distinguishes business settings, UI preferences, experience
preferences, and media preferences. Preserve the existing Task View/Status key;
do not force all preferences into schema v4 or invent per-component storage and
a generic framework. Priority remains deferred: Closed is only grouping, and
priority-aware ordering needs a separately approved domain/migration policy.

## Known scene migration concerns in the current code

These are migration concerns, not current authorization to rewrite the core:

- App.tsx swaps feature pages; Review may auto-open on safe entry and appear
  alongside the selected page. The future scene requires intentional Review
  opening and one major panel; current behavior remains unchanged.
- Focus selection/settings drafts, Task forms, and confirmations have component
  lifetimes. Panel integration must deliberately preserve useful drafts and
  clear hidden destructive confirmations without mutating business data.
- Storage errors currently sit above page content. Immersive mode needs
  discoverable failure/retry state even when the utility layer is hidden.
- History/Insights lifecycle refresh is tied to mounted hooks. Always-present
  experience context needs read-only freshness independent of panel visibility,
  including availability and local calendar context, not per-tick aggregation.
- reviewService.reload() can settle and save a draft. It is not a pure read;
  context collection must not call it merely to obtain facts. Existing shared
  successful-write composition is workflow-aware and remains unchanged.
- FocusPage.css includes global button/input rules that could style scene
  controls accidentally. Scope ownership should be reviewed when rehosting UI.
- Pre-start selected Task, captured Focus target, current Task state, and
  immutable historical title are different facts and must remain distinct.
- Task move() swaps adjacent items in the whole array. Future priority-group
  movement and insertion rules cannot simply reuse that presentation unchanged.

v0.6 should produce contracts, a migration checklist, and an isolated prototype;
production shell/routing/Review/error integration is v0.7 work after approval.

---

# 13. Design System

The v0.4 same-title Task creation hint and local confirmation are provisional UI,
not a notification system. Detection compares only trimmed, case-sensitive
titles of current open Tasks; duplicates remain allowed and no preference or
duplicate metadata is persisted. Later Art Direction / Companion work will
design a unified Quiet Feedback Language for ambient cues, contextual hints,
decision prompts, blocking errors, and companion/scene-integrated feedback.
Feedback should be noticeable without intrusion, concise, and visually weighted
by importance. No infrastructure for that future language is introduced here.

Visual polish is an important product requirement.

Shared design values should gradually move into reusable design tokens.

Examples:

```text
spacing
border radius
font sizes
surface colors
text colors
shadows
animation durations
```

Prefer CSS custom properties where appropriate.

Example concept:

```css
--space-sm
--space-md
--radius-card
--color-surface
--color-text-primary
```

This makes later visual refinement and dark/light themes easier.

Do not prematurely build a large design-system library.

---

# 14. State Management

Begin with ordinary React state and small custom hooks.

Do not introduce a global state-management framework automatically.

Add one only if application complexity demonstrates a real need.

Possible future tools should be evaluated based on actual problems rather than predicted problems.

---

# 15. Testing Priorities

Not every visual component requires heavy testing.

Prioritize tests for behavior where mistakes could corrupt data or break trust.

Important candidates include:

- timer calculations
- session completion
- analytics calculations
- storage serialization
- schema migrations
- date-boundary logic

Testing should protect important behavior without slowing development unnecessarily.

---

# 16. Future v2 Architecture

v2 introduces networking, accounts, and synchronization.

The expected conceptual transition is:

```text
v1

React Application
      ↓
Local Storage Boundary
      ↓
Browser Storage
```

becoming something closer to:

```text
v2

React Application
      ↓
Domain / Repository Boundary
      ↓
Local Cache + Remote API
      ↓
Backend
      ↓
Database
```

The exact backend technology is intentionally undecided.

It should be selected when v2 requirements are real.

---

# 17. Future Social Architecture

Social features belong to later versions.

Possible future domain concepts include:

```text
User
Profile
Friendship / CompanionRelationship
Encouragement
BoardPost
Reaction
```

These should not be implemented during v0.x merely to prepare for them.

The current architecture should simply avoid making their future addition unnecessarily difficult.

---

# 18. No Premature Authentication Model

The local version has one local user.

Do not create:

- fake login screens
- dummy JWT tokens
- placeholder servers
- simulated authentication layers

just because accounts are planned for v2.

When accounts become real requirements, they should be designed properly.

---

# 19. No Premature Realtime Infrastructure

Focus Companion currently has no need for realtime networking.

Do not introduce:

- WebSocket
- Socket.IO
- realtime databases
- message brokers

for future social features.

Even future Board messages are intended to be asynchronous and may not require realtime communication.

Realtime infrastructure should only be introduced for features that truly require it.

---

# 20. Privacy by Design

Future social functionality should assume that focus data is personal information.

When networking is eventually introduced:

- sharing should be intentional
- visibility should be configurable
- private information should not become public by default
- users should understand what companions can see

These requirements influence future design but require no networking implementation today.

---

# 21. Migration Philosophy

Focus Companion is intended to be used for a long time.

Existing user data matters.

As the application evolves:

```text
old data
↓
migration
↓
new data format
```

is preferred over:

```text
breaking change
↓
delete everything
↓
start again
```

Data compatibility becomes increasingly important as the project matures.

---

# 22. Dependency Philosophy

Every dependency should have a clear purpose.

Before adding one, ask:

1. What problem does it solve?
2. Is that problem real today?
3. Is implementing the required behavior ourselves unreasonable?
4. Does the dependency introduce unnecessary complexity?

Avoid dependency accumulation.

---

# 23. Architecture Decision Rule

When choosing between:

```text
simple implementation today
```

and:

```text
complex implementation designed for hypothetical future requirements
```

prefer the simple implementation as long as it preserves a reasonable boundary for replacement later.

For example:

Good:

```text
Storage interface
    ↓
localStorage today
```

Bad:

```text
Build cloud synchronization today
because v2 may need it someday.
```

---

# 24. Documentation Rule

Before implementing a new version:

1. read `PRODUCT.md`
2. read `ROADMAP.md`
3. read `ARCHITECTURE.md`
4. identify the current version
5. implement only that version's intended scope

When architecture materially changes:

- update this document
- explain why the change was made

Documentation should describe the real application.

It should not become fictional architecture for features that do not exist.

---

# Current Architecture Summary

For the current development stage:

```text
React + TypeScript + Vite
          ↓
Feature-oriented frontend
          ↓
Domain logic separated from UI
          ↓
Storage abstraction
          ↓
Browser-local persistence
```

Nothing more is currently required.

Build the small product well first.

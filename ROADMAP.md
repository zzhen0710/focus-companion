# Focus Companion — Roadmap

This roadmap defines the planned evolution of Focus Companion.

The project should grow through small, usable versions rather than large feature dumps.

Each version should remain stable enough to use before moving to the next one.

v0.1 and v0.2 are completed. v0.3 has not started; the sections after v0.2 are
approved future scope, not completed features or authorization to implement them.

---

# Phase 0 — Personal Focus Foundation

Goal:

Build a reliable local productivity core, then a companion-centered personal focus experience, before adding networking or social features.

---

## v0.1 — Foundation

Build the basic application structure.

### Goals

- establish the project structure
- create the main application shell
- define the initial visual system
- define clean data models
- establish local persistence
- prepare the codebase for gradual extension

### Main areas

- Focus
- Tasks
- Insights
- Profile

Not every area needs full functionality yet.

### Do not add

- accounts
- backend
- cloud sync
- social features
- friends
- boards
- networking

---

## v0.2 — Focus Timer

Build the core Pomodoro-style focus experience.

### Features

- configurable focus duration
- configurable short break
- configurable long break
- start
- pause
- resume
- reset
- focus / break state switching
- current session display
- basic session completion feedback

Only naturally completed focus periods create FocusSession records in v0.2.
Reset abandons an unfinished period without creating a record. Break completion
does not create a FocusSession. Interrupted-period recording is deferred.

### Reliability

The timer must behave correctly when:

- the page is refreshed
- the browser tab is inactive
- the computer sleeps and wakes
- the application is reopened

Timer state should not depend only on continuously decrementing a JavaScript counter.

The completed v0.2 boundary is conservative: background tabs and switching to
other applications continue counting, and a surviving Running page reconciles
system sleep using timestamps. Running progress is checkpointed. A new page
instance, including refresh or close/reopen, restores saved Running progress
as Paused and requires Resume; elapsed time while the old page was absent alone
must never award completion. Existing Completed state and completion idempotency
are preserved. BFCache restoration also remains paused. Lifecycle signals can
improve save precision but are not required for conservative cold recovery.
Environment-specific sleep/wake acceptance observations and browser limitations
are recorded in CHANGELOG.md and ARCHITECTURE.md.

---

## v0.3 — Tasks Core

Build reliable task behavior behind an internal local TypeScript application API.

### Planned scope

- reliable task model and persistence; preserve existing data through explicit migration if needed
- richer task content, lightweight completion and reopening semantics
- scheduling: unscheduled, specific date, specific date with optional time range, or broader date range
- derived views such as Today, Tomorrow, This Week, and This Month
- create, edit, delete, complete, reopen, and select tasks; optional categories and task/focus binding
- intentionally simple testing UI, retaining a card-oriented design language

Do not hard-code Daily / Weekly / Monthly as separate Task types. Do not commit
to an independent infinite-canvas Task Wall. Exact task fields, scheduling rules,
and service contracts will be decided in the v0.3 plan. Do not implement v0.3
merely because this roadmap has been updated.

---

## v0.4 — History & Daily Review Core

Preserve what happened and validate a lightweight daily review workflow.

### Planned scope

- focus and task history
- record completed and interrupted focus periods with distinguishable outcomes
- both outcomes contribute their actual focused time to total focus time
- preserve start/end time, duration, and task/category relationships where applicable
- session history, useful date filtering, and daily/task/category focus totals
- daily review of unresolved prior-day tasks
- review outcomes such as complete, move/reschedule, or drop where appropriate
- local History/Review application boundaries introduced when needed
- simple UI primarily used to validate the workflow

The interrupted-session model, precise interruption rules, task-history semantics,
and review outcomes still require a concrete version plan. Interrupted recording
belongs here, not v0.2 or v0.3. Related Insights metrics belong to v0.5.

---

## v0.5 — Insights Core

Support useful reflection with restrained analytics presentation.

### Planned scope

- focused time including actual time from completed and interrupted periods
- completed/interrupted distinction, completed count, interrupted count, and completion rate
- task completion and useful daily/weekly trends
- task/focus relationships and category/time comparisons where justified
- derived statistics behind a local Insights application boundary
- intentionally restrained analytics UI

Define the exact completion-rate calculation in this stage. Chart forms should
serve reflection, not a mandatory large dashboard or gamification. v0.3-v0.5
pages may be temporary/basic: validate behavior and APIs without spending
excessive effort polishing SaaS-style pages expected to change from v0.7.

---

## v0.6 — Experience Contracts & Art Direction

Prepare a stable productivity core for the experience layer and begin serious
art-direction prototyping.

### Planned scope

- stabilize only the application boundaries needed by the future experience layer
- define high-level experience states and mappings from business state
- prototype companion, environment, composition, visual language, animation, and sound direction
- establish a visual hierarchy centered on a companion within a comfortable environment

Local application APIs are TypeScript interfaces, not HTTP or backend APIs.
Experience / Scene / UI consumes Application Services -> Domain -> Persistence.
Business logic must not depend on avatar animations, room art, music, or rendering.
Do not require a final choice of 2D, Live2D-like, 3D, or another rendering approach.
Do not create every named service, speculative asset infrastructure, or companion
models inside the productivity domain merely to prepare for this stage.

---

## v0.7 — Companion & Main Scene

Make the companion the primary visual subject in one polished default main scene.

### Planned scope

- prioritize one high-quality default companion and one high-quality default environment
- companion remains visually present for most of the core experience
- connect Focus states to companion behavior through the experience layer
- integrate lightweight Timer / Tasks / History / Review surfaces around the scene
- use drawers, overlays, compact cards, side panels, or contextual controls where useful
- prioritize the core experience over adding productivity features

Prefer one persistent scene over frequent navigation between themed rooms.
Productivity UI should generally be visually subordinate to the companion and
environment. Existing focus/companion products are category references only;
do not copy their specific art, characters, rooms, music, animation, or UI.

---

## v0.8 — Atmosphere & Personalization

Treat atmosphere as product capability while preserving a calm, immediately
usable default. Customization should support focus rather than become the focus
of the product; high customizability must not make the default complex.

### Planned scope

- music and ambient sound; appropriate completion sound, volume control, and mute
- environmental micro-animation and richer companion idle/focus/break behavior
- lighting/day-night atmosphere where appropriate
- user-imported local image and video backgrounds
- background/foreground separation and controlled blur/depth-like, dim, and glass presentation
- foreground presets such as clean/opaque, dark or gradient overlay, and translucent/frosted-glass
- light/dark presentation, responsive layout, keyboard access, and restrained completion notifications where appropriate
- optional/reducible animation and sound
- media/resource reliability, persistence, invalid-media handling, storage limits, and recovery

Keep media import optional. Preserve the current clean default during core stages
and one polished default companion environment from v0.7. Presets and simple
adjustments should not become an unrestricted visual editor. No wallpaper
marketplace, remote discovery, or social wallpaper sharing is included.

The core user-facing local image/video background experience must be usable and
ready for beta users **no later than v0.9**. v0.8 is its intended implementation
stage; this refinement does not remove the previously approved delivery deadline.
Formats, limits, playback details, sound assets, UI placement, and media-storage
technology remain undecided. Custom completion sounds may be considered later,
but are not committed scope. Avoid attention-seeking audio or unnecessary sound features.

---

## v0.9 — Daily-Use Beta

Deploy publicly on the Web and validate the integrated product through real use.

### Planned scope

- public Web deployment without requiring accounts, backend, or social infrastructure
- real-user daily-use testing
- performance and asset-loading work
- reliability and data safety, including browser/device compatibility
- data export, import/recovery, local backup, and safe reset where appropriate
- explicit schema handling, invalid-data protection, and date-boundary correctness
- experience integration and polish
- finish any work needed to deliver the approved image/video customization experience

Avoid major feature expansion. The beta feature freeze does not cancel the
background-customization deadline above. Preserve existing user records and
settings. v0.9 ends when the integrated experience is dependable for daily use.

---

## Future Experience Implementation Boundary

These are approved directions, not implemented features. v0.1 and v0.2 remain
completed foundations; this documentation update does not start v0.3 or change
v0.2 timer behavior/schema. No premature companion components/domain models,
rendering choice, asset system, media storage fields, IndexedDB implementation,
dependencies, future settings UI, backend, or social infrastructure.

Introduce Focus, Tasks, Review, History, and Insights service boundaries only as
the corresponding version requires. Visual implementations stay outside the
productivity domain. Preserve **Companionship + Accountability** and
**Built for accountability, not attention** throughout these stages.

---

# v1.0 — Personal Focus Companion

A mature local-first, Web-first personal focus product where:

- a companion and personal environment form the main experience
- Tasks help decide what to do
- Focus helps do one thing at a time
- History and Review preserve what happened
- Insights support reflection
- atmosphere, animation, and sound make the space comfortable to keep open while working
- productivity functionality remains reliable and lightweight

Visual art, animation, music, sound, and atmosphere are product capabilities,
not final cosmetic additions. A persistent scene supports companionship and
accountability without engagement traps. Keeping the product open should serve
work, not maximize interaction. v1.0 is a dependable personal experience, not
completion of every possible future feature.

---

# Phase 2 — Connected Focus

Goal:

Turn Focus Companion from a local application into an account-based product without compromising its calm design.

Networking should be introduced carefully.

---

## v2.0 — Accounts and Sync

### Planned features

- user accounts
- authentication
- backend API
- persistent server-side storage
- multi-device synchronization
- user profile
- profile settings
- privacy settings
- local-to-account data migration

### Important principle

v2.0 is primarily infrastructure.

Do not immediately turn account support into a social network.

---

## v2.1 — Companions

Introduce intentional friend / companion relationships.

### Planned features

- send companion request
- accept / reject request
- remove companion
- companion list
- basic privacy controls

The product should encourage a small number of meaningful connections rather than collecting followers.

---

## v2.2 — Companion Profiles

### Planned profile information

- display name
- avatar
- short bio
- current goal
- selected focus categories
- optional external social links
- selected focus statistics
- current focus status, if the user chooses to share it

Users control what information is visible.

---

## v2.3 — Focus Presence

Allow companions to see lightweight focus presence.

Examples:

- Focusing
- On break
- Offline

Optional additional information:

- current category
- current goal
- elapsed focus time

Presence must remain privacy-controlled.

---

## v2.4 — Encourage

Add the signature lightweight social interaction.

A user can tap/click a companion profile or avatar and send a small predefined encouragement.

Examples:

- Keep going
- I'm with you
- Stay on target
- Don't break today
- Nice work

### Principles

- no typing required
- no conversation required
- low interruption
- no engagement loop
- easy to ignore until later

---

# Phase 3 — Focus Together

Goal:

Add asynchronous social accountability without turning Focus Companion into a messaging platform.

---

## v3.0 — Personal Board

Add a lightweight profile board.

### Board rules

A user may:

- write on their own board
- receive board messages from companions
- remove content from their own board

Only companions may write on another user's board.

### Board posts

A post may contain:

- author
- short text
- timestamp
- fixed reactions

### Intentionally unsupported

- comment threads
- nested replies
- quote replies
- instant messaging
- typing indicators
- read receipts
- infinite conversation chains

The Board is a place to leave something behind.

It is not a chat room.

---

## v3.1 — Fixed Reactions

Board posts may receive a small predefined set of reactions.

Possible examples:

- 👍
- 🔥
- 💪
- 🤝
- 🎯
- 👏

Each reaction displays a count.

Reaction design should remain intentionally limited.

Do not introduce unlimited emoji reactions or sticker systems.

---

## v3.2 — Shared Focus

Explore lightweight ways for companions to focus together.

Possible features:

- invite companion to a focus session
- shared session start
- shared session duration
- see who completed the session
- simple post-session summary

The shared session should reduce distraction rather than create interaction during focus.

---

## v3.3 — Small Focus Groups

Potential small-group functionality.

### Possible features

- small membership limit
- shared goal
- combined focus statistics
- simple group board
- shared focus sessions

### Explicitly avoid

- traditional group chat
- public communities
- endless group feeds
- engagement-driven discovery

Groups should feel like study/work rooms, not social servers.

---

# Beyond v3

Future versions should be decided primarily from real usage.

Possible directions may include:

- better cross-device experience
- desktop application packaging
- mobile companion application
- richer goal systems
- shared challenges
- carefully designed reminders
- optional integrations

None of these are commitments.

They should only be built if real usage demonstrates a clear need.

---

# Permanent Non-Goals

Unless the product philosophy fundamentally changes, Focus Companion should not become:

- a public social media network
- an infinite content feed
- an instant messaging platform
- a Discord replacement
- a follower-count competition
- an attention-maximizing product
- a bloated project-management suite

---

# Development Rule

Before beginning any new version:

1. read `PRODUCT.md`
2. read this roadmap
3. read `ARCHITECTURE.md`
4. review the current implementation
5. implement only the scope of the current version
6. update documentation after meaningful architectural or product changes

Future requirements should influence boundaries.

They should not cause premature implementation.

# Focus Companion — Roadmap

This roadmap defines the planned evolution of Focus Companion.

The project should grow through small, usable versions rather than large feature dumps.

Each version should remain stable enough to use before moving to the next one.

---

# Phase 0 — Personal Focus Foundation

Goal:

Build an excellent local single-user focus tool before adding networking or social features.

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
- finish early
- reset
- focus / break state switching
- current session display
- basic session completion feedback

### Reliability

The timer must behave correctly when:

- the page is refreshed
- the browser tab is inactive
- the computer sleeps and wakes
- the application is reopened

Timer state should not depend only on continuously decrementing a JavaScript counter.

---

## v0.3 — Tasks

Add lightweight task management.

### Features

- create task
- edit task
- delete task
- complete task
- reopen task
- select current task
- bind a focus session to a task
- optional category
- task focus-time accumulation

The task system should remain lightweight.

It should not become a complex project-management system.

---

## v0.4 — Focus History

Turn completed focus sessions into useful historical data.

### Features

- store completed sessions
- record:
  - start time
  - end time
  - duration
  - task
  - category
- daily focus total
- category focus total
- task focus total
- session history
- basic date filtering

---

## v0.5 — Insights

Build the first real dashboard for understanding time usage.

### Visualizations

- pie chart:
  - time distribution by category

- bar chart:
  - daily focus comparison
  - category comparison

- line chart:
  - 7-day focus trend
  - 30-day focus trend

### Summary data

- today
- this week
- recent 7 days
- recent 30 days

The purpose of Insights is reflection, not gamification.

---

## v0.6 — Daily Experience

Improve the experience of using Focus Companion every day.

### Features

- better empty states
- clearer status feedback
- sensible default settings
- quick task selection
- keyboard-friendly interactions where useful
- focus completion notification
- better session controls
- smoother navigation
- better handling of unfinished sessions

The goal is to reduce friction between:

open app → choose work → start focusing.

---

## v0.7 — Visual Polish

Turn the application from functional into something genuinely pleasant to use.

### Goals

- refined layout
- consistent spacing
- typography system
- polished cards
- subtle shadows
- restrained animation
- smooth transitions
- cohesive iconography
- responsive layout
- dark theme
- light theme
- excellent visual hierarchy

The interface should feel calm rather than flashy.

Beauty should improve usability.

---

## v0.8 — Reliability and Data Safety

Prepare the application for long-term personal use.

### Features

- robust persistence
- schema/version handling for stored data
- invalid-data recovery
- correct date-boundary handling
- correct sleep/wake behavior
- import data
- export data
- local backup
- safe reset option

Existing user data should not casually break when the application evolves.

---

## v0.9 — Daily-Use Beta

Stop expanding features.

Use Focus Companion as a real daily tool.

### Goal

Find problems through real usage.

### During this phase

Prioritize:

- bugs
- confusing interactions
- visual inconsistencies
- timer reliability
- data correctness
- unnecessary friction

Avoid:

- major new features
- speculative features
- premature social development

v0.9 ends when the application feels dependable enough for normal daily use.

---

# v1.0 — Personal Focus

The first formal release.

Focus Companion should now be a complete local personal productivity application.

## v1.0 Core

### Focus

- polished Pomodoro timer
- reliable session handling
- flexible duration settings
- task-linked focus sessions

### Tasks

- lightweight Todo workflow
- categories
- completion state
- task focus-time tracking

### Insights

- daily statistics
- weekly statistics
- historical data
- pie chart
- bar chart
- line chart

### Experience

- polished UI
- dark/light themes
- strong local persistence
- import/export
- reliable everyday usage

### v1.0 Definition

v1.0 does not mean:

> all planned features exist.

It means:

> the single-user personal focus experience is complete, stable, and genuinely useful.

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
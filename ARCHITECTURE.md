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

The application will eventually contain multiple interactive areas:

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

Possible fields:

```text
id
title
description
categoryId
completed
createdAt
completedAt
```

Additional fields should only be introduced when required.

---

## FocusSession

Represents a completed or active focus period.

Possible fields:

```text
id
taskId
categoryId
startedAt
endedAt
duration
status
```

FocusSession is the primary historical unit for time statistics.

Statistics should generally be derived from session records rather than stored as duplicated totals.

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

The specific chart library does not need to be chosen before v0.5.

---

# 12. UI Architecture

The long-term primary navigation is expected to remain small.

Current planned top-level areas:

```text
Focus
Tasks
Insights
Profile
```

Settings may be accessed separately without becoming a major product area.

Avoid unnecessary pages.

The product should feel compact.

---

# 13. Design System

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
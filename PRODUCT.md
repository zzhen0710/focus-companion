# Focus Companion — Product Vision

## What It Is

Focus Companion is a lightweight productivity tool built around:

- focused work
- task management
- time awareness
- progress reflection
- gentle accountability with others

It begins as a local personal tool and may gradually evolve into a connected product for people who want to focus alongside a small number of companions.

The product should remain simple, calm, and intentional even as it grows.

---

## Core Idea

> Built for accountability, not attention.

Focus Companion should help users return to their work rather than keep them inside the product.

Social features exist to provide:

- companionship
- accountability
- encouragement
- a small sense of shared progress

They must never become the main source of attention.

---

## Product Principles

### 1. Focus Comes First

Every feature should answer one question:

> Does this help the user focus, reflect, or stay accountable?

If not, it probably does not belong in the product.

### 2. Keep Interaction Lightweight

The product should support connection without becoming a traditional social network.

Prefer:

- lightweight encouragement
- visible focus status
- shared progress
- asynchronous board messages
- fixed reactions
- small companion relationships

Avoid:

- constant conversation
- attention-demanding notifications
- endless interaction loops

### 3. Calm Over Addictive

The interface should feel calm, polished, and comfortable enough to use every day.

The product should not use engagement tricks designed to maximize time spent inside the app.

### 4. Small Number of Excellent Features

Prefer a few deeply polished features over many shallow ones.

New features should only be added when they clearly improve the core experience.

### 5. Real Usage Drives Development

The product should grow from actual usage and real problems.

Do not add complexity only because a technology or feature seems interesting.

### 6. Customization Supports Focus

Focus Companion should evolve into a customizable personal focus environment.
The default experience must remain calm, minimal, clear, and immediately usable.
High customizability must not make the default experience complex.

> Customization should support focus rather than become the focus of the product.

This direction preserves the core principle: Built for accountability, not attention.

---

## Core Experience

The long-term product revolves around four main areas:

### Focus

A comfortable Pomodoro-style focus timer connected to the user's current task.

### Tasks

A lightweight task system for deciding what to work on and tracking progress.

### Insights

Clear visual feedback about where time was spent and how focus changes over time.

Examples include:

- time distribution
- daily and weekly totals
- category comparison
- long-term trends

### Profile

A minimal personal space representing the user's focus identity, goals, progress, and eventually their relationships with focus companions.

---

## Approved Focus History Direction

In the future Focus History / Insights stage, interrupted focus periods must be
recorded rather than discarded. Actual focused time from both completed and
interrupted periods must contribute to total focus time, and the two outcomes
must remain distinguishable. Future Insights must be able to derive completed
count, interrupted count, and completion rate from those records.

These are approved future requirements, not implemented v0.2 behavior. v0.2
records only naturally completed focus periods; resetting an unfinished period
abandons it without a record. The interrupted-session model, the precise
interruption rules, and the completion-rate calculation remain to be designed
in the Focus History / Insights stage. Do not introduce that model in v0.2.

---

## Social Philosophy

The future social system should feel closer to having a few study or work companions than joining a social network.

Relationships should be intentional and relatively small.

Possible future interactions include:

- seeing a friend's limited focus status
- viewing selected focus statistics
- tapping a profile to send lightweight encouragement
- sharing current goals
- leaving messages on a friend's personal board
- reacting to board messages with a small fixed set of reactions

A user may also write on their own board.

Only friends should be able to leave messages on another user's board.

Board messages are asynchronous and intentionally limited.

There is no comment tree below a board message.

Users may optionally provide external social links on their profile if they want deeper communication elsewhere.

---

## Social Boundaries

These are intentional product decisions, not missing features.

> No feeds.  
> No comments.  
> No endless chat.  
> No engagement traps.

The product should not become:

- a traditional social network
- a public content platform
- an instant messaging application
- a Discord replacement
- a place designed for endless scrolling

Even future group features should center on shared focus, goals, progress, and lightweight boards rather than group chat.

---

## Visual Direction

The interface should eventually feel:

- minimal
- modern
- elegant
- calm
- highly polished
- comfortable for long-term daily use

Visual quality matters because this is intended to become a tool users willingly open every day.

Beauty should support usability rather than compete with it.

---

## Approved Personal Focus Environment Direction

The following requirements are approved future product scope. They are not
features implemented in v0.2. The core user-facing local image/video background
customization experience must be usable and ready for beta users **no later than
v0.9 — Daily-Use Beta**. The implementation details may evolve; this delivery
requirement must remain.

### Local Background Customization

- Keep the current clean background as the default; importing media is optional.
- Allow users to import their own local image backgrounds.
- Allow users to import their own local video backgrounds.
- The experience should feel like creating a personal focus environment,
  similar in spirit to customizable wallpaper software.
- Do not include a wallpaper marketplace, remote wallpaper discovery, or social
  wallpaper sharing in this scope.

### Controlled Background Presentation

Provide a small, controlled set of adjustments, such as optional background
blur or depth-like treatment and background dimming. Keep background media
visually separate from the foreground application UI so functional content
remains clear and usable. This is a presentation requirement, not a decision
about implementation layers or media-storage technology.

Do not turn customization into an unrestricted visual editor.

### Foreground Content Surfaces

The main functional area should support a small set of presentation styles,
such as clean/opaque, dark or gradient overlay, and translucent/frosted-glass.
Keep these as presets or simple controlled adjustments. Exact preset names,
appearance, adjustment ranges, and interaction details remain undecided.

### Restrained Completion Sound

A later version must add an appropriate timer-completion sound, volume control,
and mute. The exact delivery version and sound asset remain undecided. Custom
completion sounds may be considered later; they are not a committed requirement.
Avoid attention-seeking audio design and unnecessary sound features.

### Staging and Implementation Boundary

- v0.7 establishes the visual customization foundation, background presentation,
  foreground surface styles, and controlled blur/dim adjustments.
- v0.8 addresses the reliability, persistence, invalid-media handling, storage
  limits, and recovery required by user-imported media.
- No later than v0.9, the core image/video import and background experience must
  be usable by beta users.

Media formats and limits, playback details, UI placement, persistence design,
and media-storage technology remain undecided. Choose them when the relevant
roadmap stage is implemented, based on actual requirements and testing.

During v0.2, do not add customization dependencies, placeholder components,
future settings UI, wallpaper/media domain types, storage fields, schema changes,
IndexedDB or any other media-storage implementation. Do not choose a media-storage
technology prematurely. These requirements are preserved in PRODUCT.md and
ROADMAP.md without changing the v0.2 implementation or schema.

---

## Development Philosophy

Focus Companion should evolve through small versions.

Each version should:

1. solve a small set of problems well
2. remain usable
3. preserve clean boundaries for future development
4. avoid implementing future complexity too early
5. be tested through real usage before the next major layer is added

Design for extension.

Do not prematurely build the extension.

---

## Current Stage

The project begins as a local, single-user application.

The first goal is not social networking.

The first goal is to make the personal focus experience genuinely useful:

- Pomodoro-style focus
- tasks
- time tracking
- local persistence
- useful statistics
- excellent everyday usability

Networking, accounts, synchronization, companions, profiles, boards, and reactions belong to later stages.

---

## Product North Star

A user should be able to open Focus Companion, understand what matters today, begin focused work quickly, see where their time went, receive a small amount of meaningful encouragement from people they care about, and then leave the product and continue living their life.

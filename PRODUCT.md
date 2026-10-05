# Focus Companion — Product Vision

## What It Is

Focus Companion is a local-first, Web-first personal focus product whose
long-term core experience is **Companion + Environment + Atmosphere**, supported
by reliable, lightweight productivity tools.

The intended feeling is: "I enter a personal focus space where a companion is
quietly working alongside me." A virtual companion and comfortable environment
should become the primary visual experience. Timer, Tasks, History, Review, and
Insights remain important functional layers integrated into that experience.
The product should not evolve primarily into a traditional productivity
dashboard with a character added on top.

The virtual companion is part of the local personal experience; it does not
require accounts or social infrastructure. Optional relationships with real
people remain a separate, later direction. The product must remain calm,
clear, immediately usable, and intentional as it grows.

---

## Core Idea

> Built for accountability, not attention.

Focus Companion should help users return to their work rather than keep them inside the product.

Quiet virtual companionship and trustworthy personal records support the
emerging differentiation: **Companionship + Accountability**. Meaningful task
planning, daily review, history, completed/interrupted focus semantics, and
long-term reflection should remain lightweight in presentation.

Later social features exist to provide:

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

### Persistent Primary Scene

Prefer one persistent primary scene rather than frequent navigation between
multiple themed rooms. The companion should remain visually present for most
of the core experience and eventually occupy a major share of the composition,
supported by an atmospheric environment. Productivity UI should generally be
visually subordinate once the companion stage begins.

Tools may appear as drawers, overlays, compact cards, side panels, or contextual
controls without unnecessarily replacing the scene. These are interaction
directions, not a frozen layout or a requirement to create every surface.

During v0.3-v0.5, intentionally basic pages are acceptable for validating
behavior and local application APIs. Do not over-polish temporary SaaS-style
dashboards expected to be redesigned from v0.7 onward. The current v0.2
navigation remains a valid foundation, not the final experience hierarchy.

The following tools form lightweight functional layers around that scene.

### Focus

A comfortable Pomodoro-style focus timer connected to the user's current task.

### Tasks

A lightweight task system for deciding what to work on and tracking progress.

Scheduling should support unscheduled tasks, a specific date, a specific date
with an optional time range, or a broader date range. Do not hard-code Daily,
Weekly, and Monthly as separate Task types. Today, Tomorrow, This Week, and
This Month can be derived views of scheduling data.

Preserve card-oriented presentation without committing to a large independent
infinite-canvas Task Wall. Long-term Tasks should integrate lightly into the
primary scene through drawers, side panels, contextual cards, or similar tools.
Exact fields, date/time rules, and interactions belong to the corresponding
implementation plan, not this direction document.

### History and Daily Review

History preserves focus and task outcomes. Daily Review revisits unresolved
prior-day tasks, with outcomes such as complete, move/reschedule, or drop where
appropriate. v0.4 owns this workflow; exact review and history models remain
to be designed. Review should help the user decide what comes next without
becoming enterprise project management.

### Insights

Clear visual feedback about where time was spent and how focus changes over time.

Examples include:

- time distribution
- daily and weekly totals
- category comparison
- long-term trends

Profile and optional future social surfaces are secondary to the primary
personal scene; the current Profile placeholder is not a requirement for a
visually dominant long-term page.

### Companion, Art, and Atmosphere

Visual art, animation, music, sound, and atmosphere are product capabilities,
not merely final cosmetic polish. The first serious companion release should
prioritize one high-quality default companion and one high-quality default
environment over many shallow variants. Animation and sound must be optional
or reducible and must support focus rather than demand attention.

Existing cozy focus/companion products are category references only. Do not
copy their specific art, characters, rooms, music, animation, or UI.

Art direction begins in v0.6; the main companion scene belongs to v0.7 and richer
atmosphere/personalization to v0.8. Do not choose 2D, Live2D-like, 3D, or another
rendering approach yet. Do not create speculative asset systems or companion
domain models inside the productivity core.

### Development Boundary

Build the productivity core behind local TypeScript application/service
interfaces before the experience-heavy stages. These are not HTTP/backend APIs.
The intended layering is Experience / Scene / UI -> Application Services ->
Domain -> Persistence. Focus, Tasks, Review, History, and Insights are potential
boundaries, introduced only when their version needs them.

The experience layer consumes business state and actions without embedding
business rules. Domain/application code must not depend on specific animations,
room art, music, or visual implementations. A Focus state may be mapped to a
studying companion by the experience layer; the domain does not know that visual
representation. Exact service contracts and rendering details remain undecided.

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
in v0.4 History & Daily Review Core and v0.5 Insights Core respectively. Do not
introduce that model in v0.2.

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

- Keep the current clean background as the default during the productivity-core
  stages; media import stays optional. v0.7 establishes one polished default
  companion environment, and customization must preserve a calm, immediately
  usable default rather than require users to configure it.
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

v0.8 must add an appropriate timer-completion sound, volume control,
and mute, alongside restrained music/ambient sound. The sound asset remains undecided. Custom
completion sounds may be considered later; they are not a committed requirement.
Avoid attention-seeking audio design and unnecessary sound features.

### Staging and Implementation Boundary

- v0.6 establishes experience contracts and serious art-direction prototypes.
- v0.7 establishes the companion and one polished default main scene, with
  lightweight productivity surfaces integrated around it.
- v0.8 adds atmosphere and personalization: music/sound, environmental and
  companion behavior, optional lighting/day-night treatment, image/video
  backgrounds, and controlled blur/dim/glass and foreground surface styles.
  It also addresses media/resource reliability, persistence, invalid media,
  storage limits, and recovery.
- v0.9 integrates and polishes the experience, validates reliability and data
  safety, and supports public Web deployment and real-user daily use.
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

Networking, accounts, synchronization, relationships with real companions,
profiles, boards, and reactions belong to later stages. The local virtual
companion follows the separate v0.6-v0.8 experience roadmap; neither direction
is implemented in the current v0.2 foundation.

---

## Product North Star

A user should enter a personal focus space, feel a companion quietly working
alongside them, decide what to do, focus on one thing, review what happened,
and reflect over time. Atmosphere can make the space comfortable to keep open
while working; reliable tools support accountability without demanding constant
interaction. Later encouragement from trusted people may support this experience.
The user should remain free to return attention to their work and life.

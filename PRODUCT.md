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

The approved future experience is one persistent Main Scene / App Shell. Its
default is Companion + Environment: the user remains in the same room while
temporarily opening tools. Focus, Tasks, Review, History, Insights, and eventual
Settings are secondary cards, drawers, overlays, or contextual panels. This
direction is not implemented in the current v0.5 shell.

The Companion is the unique dominant visual focal point and primary visual /
emotional anchor. The environment supports it; productivity UI remains
subordinate. Dominance means the strongest intentional focal subject, achieved
through scale, placement, composition, contrast, whitespace, and restrained
utility UI, not a rigid screen percentage. The intended feeling is "a companion
sharing a space with me", rather than a dashboard containing a character.

The entire utility interface must be dismissible. The Companion and scene are
the persistent visual experience; a minimal Global UI Handle remains available
to reveal controls. Utilities can retreat without requiring literally zero UI
pixels. Opening a panel must leave the Companion visually meaningful.

The future handle is one tiny, stationary, quiet upper-right/top-edge entry
with a comfortably larger hit target, native button semantics, visible keyboard
focus, and vertical Show controls / Hide controls meaning. Its exact mark is
open; a rectangle, literal wind chime, dragging, or swinging is not required.
Persistent errors may give it a subtle attention state.
v0.7 has exactly five launchers: Focus, Tasks, Review, History, Insights.
The discriminated immersive / utilityReady / activePanel(tool) state permits
at most one primary functional card and zero to two subordinate auxiliary
bubbles. This is a hard upper bound, not a target occupancy. Narrow screens
normally suppress auxiliaries first. Reveal normally shows launchers only;
collapse hides the card, auxiliaries, and launchers. Immersive contains only the
scene, Companion, and handle; messages do not persist there in v0.7.
Selecting another tool replaces the panel; selecting the active tool may close
it. Reopening controls does not automatically restore the previous panel.

Hiding or switching utilities is a presentation action, not Task submission,
Review resolution, Focus Pause/Reset, or destructive confirmation. Unfinished
non-destructive drafts should generally survive in memory; dismissed destructive
confirmations require renewed intent. When the Main Scene ships, pending Review
should normally offer a quiet indication for intentional opening, not auto-open
a large panel. Critical errors must remain discoverable when controls collapse;
ordinary background errors must not automatically open a large panel without
later explicit approval. Detailed future contracts are in
[Experience Contracts](docs/experience-contracts.md).

During v0.3-v0.5, intentionally basic pages are acceptable for validating
behavior and local application APIs. Do not over-polish temporary SaaS-style
dashboards expected to be redesigned from v0.7 onward. The existing
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

Approved deferred semantics: P1 / P2 / P3, with P1 highest, provide coarse
ordering; manual order provides fine ordering within a priority group. Future
views may offer All Active, each priority, and Closed with Completed / Dropped.
Closed is presentation grouping only; domain states remain open / completed /
dropped. Priority, its migration/default policy, and ordering interactions are
future work, not v0.6 delivery or prerequisites for v0.7. Current Up/Down controls
may become lighter icons or card/drag reordering, with keyboard alternatives.

### History and Daily Review

History preserves focus and task outcomes. Daily Review revisits unresolved
prior-day tasks, with outcomes such as complete, move/reschedule, or drop where
appropriate. v0.4 implemented this workflow, immutable outcome snapshots, and
resumable Review. Review should help the user decide what comes next without
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

The approved production direction is a human anime-inspired Companion as the
strongest intentional focal subject in a warm nighttime study room, with a
sleeping cat as secondary companionship. Use lavender/mauve with cream/amber
light, cool moonlight blue, and restrained natural green, not monochrome purple.
Thin visible drink steam and restrained peripheral haze support the atmosphere.
Protect the face, hands/meaningful pose, cat, and important desk activity from
UI obstruction and blur. Concept art is a visual north star, not an exact
character, outfit, density, timer ring, coordinate, typography, skyline, or copy
specification. [Art Direction](docs/art-direction.md) preserves the visual and
layering contracts without choosing a final rendering engine.

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

### Deterministic Context and Quiet Feedback

No LLM / AI Agent is planned before v1.0. Companion intelligence should use
deterministic product state, saved history, factual Insights, context rules, and
expression rules. Even after v1.0, AI requires a separate product, privacy, and
architecture decision. Do not infer tiredness, laziness, stress, productivity,
or mood from activity. The intended feeling is "The Companion noticed what
happened", not psychological analysis.

The future experience consumes curated read-only context, preserving live
state, committed facts, pending UI state, historical snapshots, and unavailable
data as distinct concepts. A failed read is not zero activity; an unsaved action
is not history. Domain facts must not directly command artistic expression.

Proactivity permits at most one primary reaction plus one compatible ambient
cue. Silence is valid. Rules must consider priority, suppression, cooldown,
deduplication, stable fact identity, once-per-session behavior, stale expiration,
Focus-time interruption avoidance, and suppression during user decisions.
Opening the app must not replay historical events; missed reactions must not
form a backlog, and ticks/checkpoints/reloads must not repeatedly trigger cues.

Future expression bubbles may pair a stable low-weight ambient message with a
limited event-bound acknowledgment, within the auxiliary cap. Use deterministic
approved vocabulary, semantic keys/tightly defined parameters, and factual
context. Personalized means context-appropriate, not emotional inference.
No expandable conversation, freeform chat, message history, LLM, or Agent is
approved. Text remains selectable HTML; handwriting is only for short optional
copy, never instructions, numbers, errors, buttons, or accessibility-critical
content. Baseline initialization and stale/error recovery are silent; hidden
optional reactions never replay later. Operational feedback takes priority.
Functional-card visibility remains UI state, separate from expression intent.

Quiet Feedback Language has four levels: Ambient cue (low weight, no action),
Context hint (local, informative, non-blocking), Decision prompt (explicit local
choice, not a disappearing toast), and Blocking error (an operation cannot
proceed, with discoverable recovery). The importance of feedback determines its
visual weight. Define behavior before choosing bubbles, notes, letters, objects,
cards, scene changes, or animation. All new product copy remains English,
concise, calm, natural, direct, and visually lightweight.

### Future Unified Settings

Settings may group Focus, Tasks, Companion, Atmosphere, Appearance, and Data.
Keep business settings, UI preferences, experience preferences, and media
preferences distinct; do not force them all into the schema-v4 business document.
The separate Task View/Status preferences are a useful precedent. Avoid both
ad hoc storage per component and a premature generic settings framework.
Duplicate-warning suppression is only a possible preference pending separate
approval. Settings is not implemented by this consolidation.

### Deferred Knowledge Capability

Knowledge requires a later separate capability approval: it is not v0.7 scope,
not required for v0.8, and not promised for v1.0. Possible scope includes notes,
saved learning material, project references, local collections, searchable
personal/project information, and a future Companion/Agent context source.
Final UX remains undecided. Do not introduce a launcher, schema, indexing,
search infrastructure, RAG, embeddings, vector storage, LLM, or Agent now.
Knowledge is conceptually independent from AI: local/static Knowledge may exist
without an LLM; separately approved future AI may consume it as one context source.

---

## Approved Focus History Direction

v0.4 records completed and interrupted Focus periods as distinguishable outcomes.
Explicit unfinished Focus Reset records interrupted time at one full trustworthy
second or more; lifecycle/recovery does not create interruptions. v0.5 derives
total actual focused time from both outcomes, counts each separately, and defines
session completion rate as completed sessions divided by all recorded sessions
(null when there are none). These are factual summaries, not productivity scores.

The historical v0.2 release recorded only naturally completed Focus periods;
unfinished Reset abandoned the period without a record. Interrupted recording
was introduced in v0.4, not retroactively added to earlier release behavior.

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

v0.1-v0.5 have completed the Foundation, Focus Timer, Tasks, History / Daily
Review, and Insights business core. Approved pre-v0.6 consolidation archives the
transition from facts and workflows toward experience architecture, Companion,
scene, and expression. v0.6 is a bridge for contracts and Art Direction, not
another large productivity release; implementation has not begun.

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
is implemented in the current productivity core.

---

## Product North Star

A user should enter a personal focus space, feel a companion quietly working
alongside them, decide what to do, focus on one thing, review what happened,
and reflect over time. Atmosphere can make the space comfortable to keep open
while working; reliable tools support accountability without demanding constant
interaction. Later encouragement from trusted people may support this experience.
The user should remain free to return attention to their work and life.

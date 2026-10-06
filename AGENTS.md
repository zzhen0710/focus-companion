# Focus Companion — Agent Instructions

This repository is a long-term product project.

Before making meaningful changes, understand the product and the current development stage.

## Required Reading

Before implementing a feature or making an architectural change, read:

1. `PRODUCT.md` — product vision and permanent product principles
2. `ROADMAP.md` — version scope and planned evolution
3. `ARCHITECTURE.md` — architectural boundaries and technical direction

These documents are the project's source of truth.

---

## Current Development Stage

The project is currently in:

**v0.6 — Experience Contracts & Art Direction (implemented; browser acceptance pending)**

v0.1-v0.5 provide the completed, accepted production business core. v0.6 adds
pure contracts/rules and a separate in-memory Main Scene prototype only.
Production integration remains v0.7 and requires explicit approval. Detailed
contracts and prototype acceptance steps are in
`docs/experience-contracts.md` and `docs/art-direction.md`.

Do not implement features from later versions unless the user explicitly changes the current scope.

In particular, do not prematurely implement:

- accounts
- backend services
- cloud synchronization
- friends / companions
- profiles
- boards
- reactions
- realtime networking
- WebSocket
- social infrastructure

Future requirements should influence clean boundaries, not current implementation complexity.

Here, friends/companions means social relationships with real people. The future
local virtual companion is a separate experience capability, planned for v0.7;
do not implement it in the productivity-core stages. v0.2 is completed;
v0.3 through v0.5 are completed and accepted. v0.5 provides the read-only
aggregation layer. Do not start v0.7 without explicit approval.

Tasks use floating local calendar schedules and persistent array order. Completed
tasks remain editable; preserve lifecycle facts through the limited TaskEvents,
without introducing a general audit framework. Category
references are compatibility data, not authorization for category management.
The local Task service owns mutations and reads the latest valid document before
saving. Preserve captured Task/category targets and all v0.2 timer timing,
checkpoint, conservative recovery, completion, and retry guarantees. Never erase
FocusSession records when deleting a Task; block deletion of an unfinished
timer's target. Explicit unfinished Focus Reset records interrupted time only
at one full trustworthy second or more, flooring actual seconds. Lifecycle events
never create interruptions. Failed Reset intents remain frozen and retryable.
Tasks have strict open/completed/dropped transitions; Reopen before changing
between terminal outcomes. TaskEvents and Focus title snapshots are immutable.
Review is a dismissible soft gate with a persisted cohort; count only real linked
actions and cancel empty untouched drafts. Schema v4 migrates legacy facts without
fabricating events or titles. v0.5 derives Insights and filters History without
changing schema v4 or any write-side workflow. Insights receives load capability
only. Use explicit reference time/calendar context, Monday weeks, and seven local
dates including today. Focus totals use stored actual duration and endedAt day
attribution; never count a live timer or fabricate missing historical Task events.
Task activity counts operations, separate from Open/Overdue now; Review-linked
actions are subsets, attributed by their own timestamps. Group Task Focus by ID
and historical title captures, never current titles. Empty session rate/average
are null. No Category analytics, persisted aggregates, or Companion interpretation.
Keep Task completions distinct from Completed sessions / Interrupted sessions.
Manual Task completion creates no FocusSession; natural Focus completion does
not complete the Task. Unfinished Focus Reset does not create a Task completion.

New product and documentation copy is English; preserve historical release text.
Same-title creation warnings compare only trimmed,
case-sensitive titles of open Tasks, and permit Create Anyway; Back preserves
the draft. Feedback is provisional until the later Quiet Feedback Language work.
Task View/Status default to All dates / Open and persist separately under
`focus-companion:ui:task-view`; never put these preferences into Task records or
let malformed/unavailable UI preferences block durable schema v4 data.

---

## Product Principle

The core product principle is:

> Built for accountability, not attention.

Permanent social boundaries include:

- No feeds.
- No comments.
- No endless chat.
- No engagement traps.

Do not introduce features that conflict with these principles without explicit user approval.

---

## Development Style

Work in small versions.

For each task:

1. identify the current roadmap version
2. implement only the requested scope
3. preserve simple and clean boundaries
4. avoid speculative abstractions
5. keep the application usable
6. verify the result before finishing

Do not advance to the next roadmap version automatically.

Wait for the user to decide when a version is ready to progress.

---

## Architecture Direction

Current stack:

- React
- TypeScript
- Vite
- CSS
- browser-local persistence

Current product model:

- local
- single-user
- offline-capable
- frontend-only

Prefer:

- feature-oriented organization
- explicit domain models
- domain logic separated from UI where practical
- storage behind a small abstraction
- timestamp-based timer calculations
- derived analytics rather than duplicated totals
- stable IDs
- simple implementations with replaceable boundaries

Avoid unnecessary dependencies and premature infrastructure.

The approved future layering is Experience / Scene / UI -> local TypeScript
Application Services -> Domain -> Persistence. These services are internal
application APIs, not HTTP/backend APIs. Introduce Focus, Tasks, Review, History,
and Insights boundaries only when their version needs them; do not create all
interfaces in advance. Experience consumes business state/actions without
embedding business rules. Domain/application code must not depend on companion
animations, room art, music, or rendering. Do not add companion domain models,
speculative asset systems, or choose a rendering technology prematurely.

The isolated v0.6 context is a curated read-only factual view, not raw AppData/service
objects. Facts and read-only Insights, plus live timer/selection state, feed
Context -> Rules -> Expression Intent -> presentation. Distinguish committed,
live, pending, historical, stale, and unavailable state; a failed read is not
zero and an unsaved action is not history. Context reads must not execute
Review settlement: reviewService.reload() is workflow-capable. Timer ownership
must outlive tool panels, and context freshness must not depend on an open
Insights/History panel. Do not alter existing timing/recovery/write guarantees.

No LLM / AI Agent is planned before v1.0; later AI needs a separate product,
privacy, and architecture decision. Do not infer psychological states. The
deterministic rules in v0.6 permit one primary reaction plus one compatible ambient cue;
silence is valid. Use stable identities, suppression, cooldown, expiration, and
deduplication; no historical replay, missed-reaction backlog, or tick-triggered
repetition. Validate a small initial set, not a reaction catalogue.

---

## Visual Direction

The product should feel:

- minimal
- calm
- modern
- elegant
- highly polished
- comfortable for daily use

Visual quality matters.

The long-term visual core is Companion + Environment + Atmosphere, supported by
reliable lightweight tools. From the companion stage, prefer one persistent
primary scene with the companion occupying a major share of the composition;
tools may use drawers, overlays, compact cards, or side panels.

The approved future Companion is the unique dominant intentional focal subject,
without a rigid screen percentage. The scene persists; the entire utility layer
is dismissible except a minimal accessible top-edge/upper-right Global UI Handle
that is tiny, stationary, quiet, and uses native button semantics, a larger hit
target, visible focus, and vertical Show controls / Hide controls meaning. Its
shape is open; no required rectangle, wind chime, dragging, or swinging.
v0.7 has exactly Focus, Tasks, Review, History, Insights launchers; no Music,
Ambience, Settings, Journal, More, or Knowledge launchers. Discriminated immersive,
utilityReady, and activePanel(tool) states permit at most one primary functional
card and zero to two subordinate auxiliary bubbles: hard cap, not target.
Suppress auxiliaries first on narrow screens. Reveal shows launchers only;
collapse hides the card, auxiliaries, and launchers, never restoring an old panel.
Immersive v0.7 has only scene, Companion, and handle, no personalized messages.
Utility hiding/switching must never
perform business actions. Retain non-destructive drafts in memory and require
renewed intent for hidden destructive confirmations. Future Review is opened
intentionally, with quiet pending indication. Errors stay discoverable in
immersive mode; ordinary background errors must not auto-open a large panel.

Quiet Feedback levels are Ambient cue, Context hint, Decision prompt, and
Blocking error; importance determines visual weight. Explicit decisions stay
locally anchored rather than disappearing as toasts; define behavior before art.
v0.6 implements contracts and an isolated fixture prototype;
production Main Scene/handle/panel integration remains v0.7. Layered 2D / 2.5D
is the first prototype preference, not a final rendering stack. Music/media,
day/night, skins, and deeper personalization remain primarily v0.8.

The approved production direction is a human anime-inspired Companion in a warm
nighttime study room with a secondary sleeping cat. Lavender/mauve, cream/amber,
moonlight blue, and restrained green avoid monochrome purple. Protect face,
hands/pose, cat, and desk activity; drink steam is thin and haze stays peripheral.
Concept art is a north star, not exact assets, coordinates, typography, or UI copy.
Use roughly two to three shared authored CSS layouts with stable DOM/keyboard
order, latest-input-wins restrained motion, and reduced-motion alternatives;
no physics/collision/layout engine. Default readable glass and practical static
steam/light belong to v0.7; configurable presets/media remain primarily v0.8.
Follow docs/art-direction.md and docs/experience-contracts.md for full contracts.

Functional-card visibility stays UI state; factual auxiliaries, deterministic
expression, and operational feedback remain distinct. Operational feedback wins
over optional content. Messages use approved vocabulary and selectable HTML,
no persisted conversation, emotional inference, LLM, or Agent. Optional hidden
reactions never replay later. Do not add expression channels before independent
lifetimes require them. Knowledge is separately deferred: not v0.7, not required
v0.8, not promised v1.0, and independent from AI. No Knowledge launcher/schema,
indexing/search, RAG, embeddings, vector storage, or AI infrastructure now.

Deferred Priority is P1/P2/P3 (P1 highest), with manual order within groups;
Closed is UI grouping for completed/dropped, never a domain status. Domain,
migration/default, movement, and insertion policies need separate planning.
Priority/drag improvements are not v0.6 delivery or prerequisites for v0.7.
Preserve keyboard ordering alternatives. Future unified Settings keeps business,
UI, experience, and media preferences distinct; no schema-v4 catch-all or
premature framework. Duplicate-warning suppression needs separate approval.

v0.3-v0.5 UI may remain intentionally basic to validate behavior and local
application APIs. Do not over-polish temporary SaaS-style dashboard pages that
will be redesigned from v0.7. Preserve task cards without committing to a large
independent infinite-canvas Task Wall. Task scheduling is flexible data, not
hard-coded Daily/Weekly/Monthly task types.

Art, animation, music, sound, and atmosphere are future product capabilities,
not merely decoration. Prioritize one excellent default companion/environment,
with optional/reducible motion and sound. Category references are permitted;
copying another product's specific art, characters, rooms, music, animation,
or UI is not.

However:

> usability first, polish second, decoration last.

This ordering does not demote the approved companion/atmosphere experience to
cosmetic polish. Build it in its roadmap stage while preserving usability and
the principle Built for accountability, not attention.

Avoid visual clutter, excessive gradients, unnecessary animation, gimmicks, or dashboard-style information overload.

---

## Documentation

Documentation must describe the real project, not imagined implementation.

Update documentation when:

- architecture materially changes
- roadmap scope changes
- product principles change
- important development or usage instructions change

Do not casually rewrite `PRODUCT.md`, `ROADMAP.md`, or `ARCHITECTURE.md` merely to match an implementation shortcut.

If implementation conflicts with those documents, surface the conflict first.

---

## Data Safety

Focus Companion is intended for long-term daily use.

Treat stored user data as valuable.

Avoid changes that unnecessarily destroy or invalidate existing data.

As persistence evolves, prefer explicit migration over silent breaking changes.

---

## Verification

Before considering a coding task complete:

- check for TypeScript errors
- run available tests
- run the build
- verify the relevant behavior manually when practical
- report anything that could not be verified

As project commands are established, keep this section updated with the exact commands.

Current verification commands:

```sh
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Start the development server with `npm run dev` and verify the relevant behavior
manually. On Windows PowerShell, use `npm.cmd` in place of `npm` if execution
policy blocks `npm.ps1`.

The isolated development URL is `/prototypes/main-scene/`; `?lab=1` exposes
in-memory scenarios. It must not import production bootstrap/service composition,
instantiate storage, call workflow/mutation APIs, or write browser storage.
Keep production runtime/config/package files unchanged. Schema remains v4 with
the existing v1 -> v2 -> v3 -> v4 chain. Do not add it as a production build input.
Prototype timing (3-second primary, 10-second cooldown, 30-second freshness,
Review cue once per page) and day phases are tuning conventions, not final policy.
Maintain draft retention, confirmation clearing, keyboard focus/Escape hierarchy,
reduced motion, and discoverable errors without automatic panel opening.

---

## Decision Rule

When uncertain between:

- building something simple that satisfies the current version, or
- building a complex abstraction for a hypothetical future version

choose the simple solution if it preserves a reasonable future replacement boundary.

Design for extension.

Do not prematurely build the extension.

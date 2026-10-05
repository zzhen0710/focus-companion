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

**v0.4 — History & Daily Review Core (completed and manually accepted)**

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
v0.3 and v0.4 are completed and accepted. Do not start
v0.5 without explicit approval.

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
fabricating events or titles. Insights/totals/filtering remain v0.5.

Product UI copy is English. Same-title creation warnings compare only trimmed,
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

---

## Decision Rule

When uncertain between:

- building something simple that satisfies the current version, or
- building a complex abstraction for a hypothetical future version

choose the simple solution if it preserves a reasonable future replacement boundary.

Design for extension.

Do not prematurely build the extension.

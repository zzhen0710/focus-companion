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

**v0.1 — Foundation**

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

However:

> usability first, polish second, decoration last.

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

# Focus Companion

Built for accountability, not attention.

## Current scope: v0.1 — Foundation

A local, single-user React + TypeScript + Vite application with a responsive
shell, hash navigation for Focus / Tasks / Insights / Profile, a light visual
foundation, explicit domain types, and browser-local persistence.

All four areas are introductory placeholders. This version does not include a
timer, task management, session recording, analytics, editable profiles, accounts,
networking, or social features.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).
On Windows PowerShell, if execution policy blocks `npm.ps1`, use `npm.cmd ci`
and `npm.cmd run dev` instead. No execution-policy change is required.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run preview` serves the production build locally after `npm run build`.
Storage tests cover serialization, malformed data, unsupported versions, and
access/write failures. Manually check navigation, refresh, keyboard access, and
narrow layouts when changing the shell.

## Structure and persistence

- `src/app`: application shell and navigation.
- `src/features`: the four area placeholders.
- `src/domain`: Task, Category, completed FocusSession, and Settings contracts.
- `src/storage`: storage interface, defaults, localStorage adapter, and tests.
- `src/styles`: CSS tokens and global styles.

The adapter uses the localStorage key `focus-companion:data` with
`schemaVersion: 1`, empty task/category/session arrays, and duration defaults of
1500/300/900 seconds. These settings are data only; no timer or settings controls
exist yet. Navigation and derived statistics are not persisted.

Invalid or unsupported stored data is left untouched and blocks writes. Storage
failures display a message while keeping the shell accessible. There is no reset,
import/export, or migration workflow yet.

Runtime assets are served locally, with no external fonts or services. The app
does not include a service worker or guarantee offline reload when its local
server is unavailable.

Product scope and architectural direction are defined in `PRODUCT.md`,
`ROADMAP.md`, and `ARCHITECTURE.md`.

# Approved Experience Contracts

Status: approved pre-v0.6 direction, not implemented. v0.1-v0.5 completed the
business core. This document preserves future contracts; it does not authorize
implementation. PRODUCT.md owns principles, ROADMAP.md owns staging, and
ARCHITECTURE.md describes current code and future boundaries.

## Persistent scene and utility layer

Normal use should feel like staying in one room with a Companion while bringing
out temporary tools. Companion + Environment is the default experience.
The Companion is the unique dominant focal subject; utilities are subordinate
and dismissible. Dominance depends on composition, not a fixed screen share.

One persistent shell may contain EnvironmentLayer, CompanionLayer,
GlobalUiHandle, UtilityLaunchers, and ActivePanel. These are conceptual roles,
not existing components or a requirement for one giant React component.
Focus, Tasks, Review, History, Insights, and future Settings occupy secondary
surfaces. Current pages remain business-validation shells until production
integration in v0.7. Routing can support development, tests, deep links, and
compatibility without replacing the visual scene; exact history semantics
remain an implementation-planning decision.

The entire utility interface must be dismissible. A minimal handle is the
exception needed to reveal it; this does not require literally zero UI pixels.

## Global UI Handle and states

The future handle is visually quiet, small, long, flat, rectangular, and
edge-adjacent near the top, preferably upper-right. Its vertical chevron is
`⌄` for Show controls and `⌃` for Hide controls. The actual hit target must be
comfortably larger than the visible mark. Provide keyboard activation, clear
accessible labels/expanded state, visible focus, and usable edge clearance.

| State | Visible layers |
| --- | --- |
| Immersive | Companion, Environment, Global UI Handle |
| Utility-ready | Same persistent layers plus lightweight launchers |
| Active-panel | Same layers and launchers plus exactly one primary panel |

The Companion remains visually meaningful while a panel is open.

| Interaction | Presentation result |
| --- | --- |
| Reveal controls | Show launchers, normally without a panel |
| Select another utility | Replace the active panel |
| Select the active utility again | May close it to utility-ready |
| Close a panel | Return to utility-ready |
| Collapse controls | Close panel and launchers; return to immersive |
| Reveal after collapse | Normally show launchers only, not the last panel |

At most one major panel is open. Local editors/confirmations are subordinate to
that panel, not additional major panels. The handle operates above individual
panel controls. Hidden utilities must not remain keyboard-focusable; restore
focus to the handle or relevant launcher when hiding its focused contents.

## Drafts, Review, and errors

Hiding or switching panels is presentation only. It must not submit Tasks,
resolve Review, pause/reset Focus, confirm deletion, or otherwise mutate business
state. Non-destructive drafts should generally survive temporarily in memory,
without autosave or a new durable draft schema. Destructive confirmations require
renewed intent after dismissal/hiding and current-state validation. Preserve
existing service-owned pending writes and retry intents.

When the Main Scene ships, pending Review should normally produce a quiet
indication, launcher state, or optional ambient cue. The user intentionally
opens it; no normal automatic large panel. Dismissal retains the persisted cohort.
Current v0.5 safe-entry Review opening remains implemented until that integration.

Persistent/critical errors remain discoverable when utilities collapse. While a
panel is open, keep its error local; immersive mode may give the handle a subtle
attention state. Revealing controls exposes the explanation and recovery action.
Never hide persistence failure behind an apparently successful scene response.
Ordinary background errors do not auto-open a large panel without later explicit
approval. Only genuinely blocking failures may strongly override normal calm;
their exact presentation remains to be designed.

## Curated factual context

The experience consumes read-only context, not raw AppData or service objects.
Potential inputs and required distinctions are:

| Input | Meaning / boundary |
| --- | --- |
| Focus mode, status, progress | Existing live timer calculations remain authoritative |
| Active Focus target | Captured ID/title, distinct from current Task edits |
| Pre-start selected Task | Transient selection, not a captured target |
| Last committed Focus outcome | Saved session with stable ID and occurrence time |
| Today's saved focused time | Existing Insights semantics; excludes live/unsaved time |
| Pending Review | Eligible work and remaining persisted cohort remain distinct |
| Overdue Task count | Existing Review eligibility, not new inference |
| Recent committed Task outcome | Actual event, not reconstruction from current status |
| Local date/day phase | Explicit time/calendar context; no psychological meaning |
| Relevant Insights | Read-only factual summaries, not scores or judgments |
| Availability | Loading, error, stale facts, and pending state distinguished |

Keep live state, committed facts, pending UI/actions, historical snapshots, and
unavailable data distinct. A failed read is not zero activity. An unsaved action
is not history. Unknown titles/outcomes remain unknown. Task lifecycle is not an
invented progress percentage. Focus-session completion and Task completion
remain separate facts.

Freshness must work while panels are hidden, with explicit reference time and
calendar context. Do not aggregate all history per timer tick. Do not call
workflow-capable Review reload merely to read context. These are future
integration requirements, not new refresh mechanisms in the current app.

## Rules and expression intents

Facts and read-only Insights feed context; live timer state and selection may
feed it directly. Context feeds deterministic Experience Rules, then Expression
Intent, then Companion / Scene / Utility UI / future audio. Intent describes
meaning rather than animation, rendering technology, or asset names. Context
reads and expression must not execute business commands.

No LLM / AI Agent is planned before v1.0. Deterministic state, saved history,
Insights, context rules, and expression rules provide the initial intelligence.
Do not infer tired, lazy, stressed, unproductive, or bad mood. An interruption
is a factual outcome, not a moral/emotional judgment. Do not directly map it to
a sad Companion. Any later AI needs a separate product/privacy/architecture
decision; reaching v1.0 grants no automatic approval.

At most one primary reaction plus one compatible ambient cue is permitted.
Silence is valid. Arbitration considers priority, suppression, cooldown,
deduplication, stable fact identity, once-per-session behavior, stale expiration,
Focus-time interruption avoidance, and user-decision suppression.

Initial loading establishes historical context without replaying old events as
new. Missed reactions do not queue into a backlog. Ticks, checkpoints, reloads,
and retries must not repeat a reaction. v0.6 validates a very small initial set;
exact priorities, cooldown durations, expiration, and session scope need planning.

Prototype candidates only, not final production behavior:

- Focus idle: neutral.
- Focus running: work/study.
- Focus paused: pause/rest.
- Break running: relaxed.
- Natural Focus completion: brief acknowledgment of the committed fact.
- Review pending: optional ambient cue.

## Quiet Feedback Language

| Level | Contract |
| --- | --- |
| Ambient cue | Low weight, environment-level, no required action |
| Context hint | Relevant control/context, informative and non-blocking |
| Decision prompt | Explicit choice, locally anchored where practical, not a disappearing toast |
| Blocking error | Operation cannot proceed; strongest functional feedback with discoverable recovery |

The importance of feedback determines its visual weight. Define behavior before
choosing scene changes, bubbles, notes, letters, objects, cards, or animation.
All new copy is English, concise, calm, natural, direct, and visually lightweight.

## Deferred Tasks and Settings

P1 / P2 / P3 (P1 highest) are future coarse ordering; manual order is fine order
within a priority group. Future View may be All Active / Priority 1 / Priority 2 /
Priority 3 / Closed, with Completed and Dropped under Closed. Closed is UI grouping,
not a new status; open/completed/dropped domain transitions remain unchanged.
Calendar scheduling remains independent of priority.

Priority may require a domain field, validation, explicit migration, legacy/default
policy, within-priority movement, and insertion rules when priority changes.
Those policies remain undecided; no priority is inferred or implemented now.
Current Up/Down is temporary UI that may become lighter icons, card reordering,
or drag/reorder with keyboard alternatives. Neither enhancement is promised in
v0.6 or required for v0.7 Companion/Main Scene delivery.

Future unified Settings may group Focus, Tasks, Companion, Atmosphere, Appearance,
and Data. Distinguish business/domain settings, UI preferences, experience
preferences, and media preferences. Do not force them into schema v4. Existing
Task View/Status separation is useful. Avoid isolated ad hoc component storage
and a premature generic framework. Duplicate-warning suppression remains only
a possible preference unless separately approved.

## Scope and remaining planning

v0.6 is contracts, minimal rule validation, Art Direction, and an isolated
prototype after implementation planning approval. Production scene, routing,
Review/error presentation, and panel integration remain v0.7. Atmosphere/media
remain primarily v0.8, with the image/video beta deadline no later than v0.9.

Remaining decisions include route/history semantics, precise draft lifetime,
critical-error expression, the small reaction set and timing parameters, prototype
acceptance criteria, and later Priority/default/order and preference policies.
These details must not become speculative infrastructure or current features.

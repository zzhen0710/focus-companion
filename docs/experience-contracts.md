# Approved Experience Contracts

Status: v0.6 pure contracts and isolated fixture prototype implemented; real
browser acceptance pending. v0.1-v0.5 production business core remains unchanged.
Future production contracts below do not authorize starting v0.7.
PRODUCT.md owns principles, ROADMAP.md owns staging, and
ARCHITECTURE.md describes current code and future boundaries.

## Persistent scene and utility layer

Normal use should feel like staying in one room with a Companion while bringing
out temporary tools. Companion + Environment is the default experience.
The Companion is the unique dominant focal subject; utilities are subordinate
and dismissible. Dominance depends on composition, not a fixed screen share.

One persistent shell may contain EnvironmentLayer, CompanionLayer,
GlobalUiHandle, UtilityLaunchers, and ActivePanel. These are conceptual roles,
not a requirement for one giant React component or final component names.
Exactly Focus, Tasks, Review, History, and Insights are v0.7 production launchers.
Music, Ambience, Settings, Journal, More, and Knowledge are excluded; eventual
Settings is not a required v0.7 surface. Current pages remain business-validation
shells until production integration in v0.7. Routing can support development, tests, deep links, and
compatibility without replacing the visual scene; exact history semantics
remain an implementation-planning decision.

The entire utility interface must be dismissible. A minimal handle is the
exception needed to reveal it; this does not require literally zero UI pixels.

## Global UI Handle and states

The future handle is one tiny, stationary, visually quiet, edge-adjacent mark
near the top, preferably upper-right. A permanent rectangle is not required.
A pull-cord tip, small lamp-pull-inspired pendant, minimal chevron, or another
restrained scene-integrated mark may be evaluated. No literal wind chime,
dragging, swinging, or large decorative hanging ornament is required or approved.
Use a native button with vertical reveal/collapse meaning; a chevron may be
`⌄` for Show controls and `⌃` for Hide controls. The actual hit target must be
comfortably larger than the visible mark. Provide keyboard activation, clear
accessible labels/expanded state, visible focus, and usable edge clearance.

| State | Visible layers |
| --- | --- |
| Immersive | Companion, Environment, Global UI Handle |
| Utility-ready | Same persistent layers plus lightweight launchers; zero to two optional auxiliaries |
| Active-panel | Same layers and launchers plus exactly one primary functional card; zero to two optional auxiliaries |

The Companion remains visually meaningful while a panel is open.

| Interaction | Presentation result |
| --- | --- |
| Reveal controls | Show launchers, normally without a panel |
| Select another utility | Replace the active panel |
| Select the active utility again | May close it to utility-ready |
| Close a panel | Return to utility-ready |
| Collapse controls | Hide primary card, auxiliary bubbles, and launchers; return to immersive |
| Reveal after collapse | Show launchers only, never the last panel |

Use the discriminated immersive / utilityReady / activePanel(tool) model, with
the five primary tools above, not unrelated visibility booleans.
At most one primary functional card and zero to two subordinate auxiliary
bubbles may be visible. This is a hard upper bound, not a target occupancy.
Silence/empty scenes are valid; narrow screens normally suppress auxiliaries
first. Immersive has only scene, Companion, and handle: no personalized messages
remain visible in v0.7. A future exception requires separate approval.
Local editors/confirmations are subordinate to the card, not additional primary
cards. The primary card is user-driven, substantial, bounded, and may contain
forms/controls/scrolling; it never causes scene reflow. Auxiliary bubbles are
small, low-weight, read-only or minimally interactive, never feature pages.
The handle operates above individual
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
Production safe-entry Review opening remains implemented until that integration.

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
workflow-capable Review reload merely to read context. v0.6 validates this
separation with fixtures; production service integration remains future work.

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
its implemented prototype tuning is described below, not final production policy.

Prototype candidates only, not final production behavior:

- Focus idle: neutral.
- Focus running: work/study.
- Focus paused: pause/rest.
- Break running: relaxed.
- Natural Focus completion: brief acknowledgment of the committed fact.
- Task completion: acknowledgment candidate to validate arbitration only.
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

v0.6 implements contracts, minimal rule validation, Art Direction, and an isolated
prototype. Production scene, routing,
Review/error presentation, and panel integration remain v0.7. Atmosphere/media
remain primarily v0.8, with the image/video beta deadline no later than v0.9.

Remaining decisions include route/history semantics, precise draft lifetime,
critical-error expression, final production reactions/timing, and later
Priority/default/order and preference policies.
These details must not become speculative infrastructure or current features.

## Approved post-v0.6 production interaction direction

These are future v0.7 contracts, not descriptions of the isolated prototype.

### Authored layouts and motion

Start with roughly two to three shared authored families: revealed constellation,
compact-tool arrangement, and reading/editing arrangement. Keep DOM/keyboard
order stable while authoring visual positions. Move launchers only when useful
to make room for content; do not make a unique layout per tool without actual
need. Prefer CSS transform/opacity, restrained translate and slight scale.
Approximately 160–220ms is a starting reveal/movement range, not a frozen timing;
exit should be shorter than entry where appropriate. Rapid input resolves to
the latest requested state, without queued decorative sequences. Reduced motion
uses immediate changes or minimal fade, no travel/scale flourish. No physics,
collision solving, draggable layouts, generic engines, springs, bounce, or spin.

Art-protected regions plus CSS-authored anchors/layouts define the first scene's
safe zone. Defer per-scene metadata until a second real scene demonstrates need.
Navigation/deep links may identify a tool through one UtilityState adapter while
Main Scene persists; URLs do not recreate independent dashboard pages. Exact
browser Back/history behavior remains a v0.7 implementation decision.

### Content ownership and expression messages

| Content | Responsibility |
| --- | --- |
| Primary functional card | Explicit user actions and substantial feature content; UI state owns visibility |
| Compact factual auxiliary | Read-only projection of existing facts |
| Expression bubble | Deterministic rule-selected acknowledgment, ambient cue, or Companion message |
| Operational feedback | Errors, recovery, and decisions; locally anchored functional truth |

Do not combine these into generic notifications. Operational feedback outranks
optional decorative/ambient content. All auxiliary expressions/facts together
remain within the zero-to-two bubble cap, never additional feature pages.

Initial handwritten expression may pair a stable low-weight ambient message
with a limited event-bound acknowledgment; it is not expandable conversation.
Facts/live state -> Experience Context -> Experience Rules -> Expression Intent
-> scene expression remains separate from functional-card visibility. Consider
`primaryReaction` instead of `primary` for future rule output clarity, without
renaming current code or adding channels before independent lifetimes require them.
Use approved deterministic vocabulary, semantic message keys, and tightly defined
parameters. Personalized means factual context-appropriateness, not emotional
inference. No persisted message history, LLM, Agent, or freeform chat.

Message text stays real selectable HTML. Handwriting is only for short optional
copy, never important instructions, numbers, errors, button labels, or
accessibility-critical content. Preserve silence, silent baseline and stale/error
recovery, stable-ID deduplication, cooldown, freshness/expiration, no open replay
or backlog, Focus protection, and decision suppression. Hidden optional content
does not return as a delayed reaction. Never rotate messages to attract attention.

### Superseded prototype assumptions

The six-launcher set/Settings placeholder, fixed three-column grid, rectangle
handle, daylight/vector visual direction, and current card dimensions are
prototype-only, not production contracts. Preserve bounded scrolling, isolation,
context availability, read/write separation, drafts, confirmation clearing,
conservative timer semantics, and the one-primary-card principle. The implemented
validation section below records existing code without authorizing v0.7 changes.

Knowledge remains separately deferred (not v0.7, not required v0.8, not promised
v1.0). PRODUCT/ROADMAP own that decision; no Knowledge launcher, schema, search/
indexing, RAG, embeddings, vector storage, LLM, or Agent work is authorized here.

## Implemented v0.6 validation contracts

`src/experience/context.ts` exposes local date/reference time/day phase, live
Focus, saved facts, and transient Task selection. Availability is a discriminated
loading / ready(value, asOf) / stale(value, asOf, error) / unavailable(error) union.
Known empty is ready with zero totals/null identities, distinct from failure.
Saved facts contain today's Focus summary, latest committed Focus/Task outcome
with stable ID/time/historical title, overdue count, and pending Review count/ID.
Live Focus contains existing calculated elapsed/remaining time, captured target,
current Task lookup, and pending completion/reset/error flags. Selection is
separate from that captured target. No raw document reaches rendering.

The coordinator accepts a read-only loader and clock, subscriptions, explicit
saved refresh, live update, selection update, and tick. Live ticks do not recompute
saved history; local-date changes refresh it once, even if a read fails. Explicit
Retry recovers stale/unavailable state. The prototype binds safe visibility/focus/
storage-event/minute refresh with cleanup independently of panel visibility.
That binding does not read or write storage itself. No Review workflow reload
or business command is called.

The pure utility union implements immersive / utilityReady / activePanel(tool).
Selecting the current tool closes it; another replaces it; Close leaves launchers;
Collapse hides all utilities; Reveal never reopens a panel. Invalid/inapplicable
actions are no-ops. Root-owned Task draft text survives switching/Close/Collapse
in memory. Confirmation/message clears on those transitions and requires renewed
intent. None is durable.

Intent is presence (neutral / working / paused / onBreak / unknown), one optional
focusAcknowledgment or taskAcknowledgment with fact ID/expiry, and one optional
reviewPending cue. Rules baseline initial/recovered facts silently, deduplicate
IDs, prefer Focus when both arrive together, and consume suppressed/expired/losing
candidates without replay. Running Focus, active decision, hidden page, pending
writes, unavailable/stale/error context suppress optional reactions. Interrupted
Focus has no negative emotional mapping.

Prototype tuning: primary display 3 seconds; start-to-start cooldown 10 seconds;
event freshness 30 seconds; Review cue offered at most once per page instance,
retained only while compatible and pending. Once suppressed/dismissed it is not
offered again; the factual Review launcher indication can remain.
Day phase is morning 06:00–12:00, afternoon 12:00–18:00, evening 18:00–22:00,
night otherwise. These are prototype conventions, not health/mood/productivity
interpretations, final personality, or a day/night rendering engine.

Quiet Feedback uses a small Review note, panel context hint, local sample-deletion
confirm/cancel, and persistent failed-read explanation with Retry. Collapsed
error attention appears on the handle without opening a panel. Retry changes
fixtures only. Review opens intentionally; production Review remains unchanged.
Settings is a switching placeholder. Browser acceptance steps are in Art Direction.

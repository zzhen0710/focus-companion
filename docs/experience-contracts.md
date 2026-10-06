# Approved Experience Contracts

Status: v0.7 Checkpoints A-E are production-integrated using temporary structural
art. Corrected Scene structure passed user visual review. Baseline motion is now
implemented; motion browser acceptance, final artwork and polish are pending. v0.7 is not
complete. v0.6 remains an isolated fixture validation entry. Business semantics
and schema v4 are preserved. This pass does not authorize the final-art checkpoint.
PRODUCT.md owns principles, ROADMAP.md owns staging, and
ARCHITECTURE.md describes current code and future boundaries.

## Persistent scene and utility layer

Normal use should feel like staying in one room with a Companion while bringing
out temporary tools. Companion + Environment is the default experience.
The Companion is the unique dominant focal subject; utilities are subordinate
and dismissible. Dominance depends on composition, not a fixed screen share.

One persistent shell may contain EnvironmentLayer, CompanionLayer,
ToolDrawer (EdgeHandle and ToolLaunchers), BubbleWorkspace, and CompanionMessageStrip. These are conceptual roles,
not a requirement for one giant React component or final component names.
Exactly Focus, Tasks, Review, History, and Insights are v0.7 production launchers.
Music, Ambience, Settings, Journal, More, and Knowledge are excluded; eventual
Settings is not a v0.7 surface. Existing feature content is hosted inside the
persistent production Main Scene. Routing/deep links identify the Primary tool;
implemented history policy is recorded below.

The entire utility interface must be dismissible. A minimal handle is the
exception needed to reveal it; this does not require literally zero UI pixels.

## Authoritative production drawer and workspace

This approved correction supersedes the previous one-card/expression-auxiliary
interpretation. The isolated v0.6 prototype remains historical fixture validation.
Earlier ROADMAP v0.7 launcher-layout/immersive-message wording predates this
correction; this contract supersedes those presentation details while preserving
the roadmap's version ordering and business scope.

ToolDrawer has a stable right-edge native Handle. Left means Show tools, right
means Hide tools. A small circular mark has a comfortable hit target, accessible
name/expanded state, visible focus and persistent-error attention. Launchers are
circular icons with accessible names and hover/focus labels, in stable Focus,
Tasks, Review, History, Insights order. Their positions never vary by active tool.

BubbleWorkspace has explicit primary / auxiliaryA / auxiliaryB slots, at most
three unique tools, no arbitrary geometry or persisted composition. First open
fills Primary, second Aux A (lower-right), third Aux B (lower-left). This authored
opening-side default is not persisted; future Settings needs separate approval.
A fourth closed tool replaces the
least-recently-opened Auxiliary, preserving Primary. Opening time is not changed
by ordinary activity. Closing Primary promotes the most recently active remaining
Auxiliary; focus/pointer interaction records activity. Promotion swaps tools.
Aux-to-Aux movement swaps or moves into an empty Aux. Moving Primary into an empty
Aux is disabled so no functional Aux remains beneath an empty Primary.

Pointer dragging starts on a grip, snaps only to the three authored slot targets,
and cancels outside them. Arrange controls provide Promote / Move to Aux A/B
without dragging. Movement does not execute business actions. Collapse clears
slots and hides launchers; Reveal starts empty. Drafts remain application-owned.

Every tool has explicit Primary / Compact views. Compact is reduced content,
not a scaled full page. Primary is richer in function, not dramatically taller.
No functional bubble defines an internal vertical scrollbar. Tasks and Review
show one item at a time; Task editing has Details / Content / Schedule subviews;
History pages one recorded entry; Insights selects Focus / Tasks / Review / Trend /
Task focus, paging day/group detail. Focus separates Timer and duration editing.
These are presentation subdivisions, not new facts or formulas.

The independent CompanionMessageStrip is not a functional Auxiliary. It occupies
a narrow bottom region with breathing room, real selectable text and its own
collapse/restore control. It can remain visible while tools collapse. Message
visibility is in memory only. The later Message Board expansion is deferred:
no history persistence, generic notifications, chat, LLM or Agent now.

Narrow/short viewports show only usable Primary, keep slot composition in memory,
and offer a Primary selector for promoting hidden open tools. Optional message
presentation is suppressed on these layouts and consumed without delayed replay.
Hidden content is unfocusable. Slot changes focus the moved tool heading, with a
visible Primary fallback; closures restore launcher focus, Collapse restores the
Handle. Escape dismisses local decisions/Arrange, then closes the focused tool,
then closes Primary or collapses empty tools. Scene artwork never reframes.

## Drafts, Review, and errors

Hiding or switching panels is presentation only. It must not submit Tasks,
resolve Review, pause/reset Focus, confirm deletion, or otherwise mutate business
state. Non-destructive drafts should generally survive temporarily in memory,
without autosave or a new durable draft schema. Destructive confirmations require
renewed intent after dismissal/hiding and current-state validation. Preserve
existing service-owned pending writes and retry intents.

Pending Review produces a quiet launcher indication or compatible optional cue.
Only intentional Primary Review entry (first open, promotion or deep link) calls
the workflow open path. Compact Review receives read-only facts and no workflow
commands; it cannot create, settle or resolve a cohort. Close/Collapse
retain the cohort; safe entry no longer automatically opens or creates Review.
Workflow-aware settlement on safe entry/date/focus and successful writes remains.

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
workflow-capable Review reload merely to read context. v0.6 validated this
separation with fixtures; the v0.7 production bridge now connects validated
saved facts and the authoritative Timer snapshot without entering Review.

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
prototype. v0.7 Checkpoints A-E now integrate production scene, routing,
Review/error presentation and existing tools; final artwork remains pending. Atmosphere/media
remain primarily v0.8, with the image/video beta deadline no later than v0.9.

Remaining decisions include final art/visual acceptance, final production
copy/reactions/timing, and later
Priority/default/order and preference policies.
These details must not become speculative infrastructure or current features.

## Approved post-v0.6 production interaction direction

These approved v0.7 contracts guide the integrated structural scene. Final art
and personality are not delivered by Checkpoints A-E.

### Authored slots, motion and content ownership

One fixed launcher rail emerges left from the edge; no constellation/focus/reading
re-layout remains. Three authored workspace slots use CSS grid, not physics or a
collision/layout engine. Primary sits above the compact Aux row. Aim for about
30% viewport width and 60% height on a normal desktop, adapting for usability.
Reduced motion removes entry travel. Pointer movement never persists coordinates.

| Content | Responsibility |
| --- | --- |
| Primary functional bubble | Full important actions in a focused current subview |
| Compact functional bubble | Explicitly opened tool with reduced state/essential actions |
| CompanionMessageStrip | Independent deterministic current expression, not an Aux slot |
| Operational feedback | Functional error/recovery or Handle attention, never handwritten |

Rules retain primaryReaction, baseline/recovery silence, stable IDs, cooldown,
expiration, no backlog/replay, Focus/decision suppression and no emotional
inference. The strip shows acknowledgment ahead of compatible ambient copy;
there is no notification queue or persisted history. Closing tools alone does not
suppress the independently visible message. Collapsing the strip or a constrained
layout consumes optional events without later replay.

### Superseded prototype assumptions

The six-launcher set/Settings placeholder, fixed three-column grid, rectangle
handle, daylight/vector visual direction, and current card dimensions are
prototype-only, not production contracts. Internal prototype scrolling is also
superseded for production. Preserve isolation,
context availability, read/write separation, drafts, confirmation clearing,
conservative timer semantics, and the one-primary-card principle. The implemented
validation section below records v0.6 behavior; compatibility updates do not
authorize final-art replacement or v0.8 features.

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
fixtures only. Review opens intentionally; at v0.6, production Review remained unchanged.
The former Settings switching placeholder was removed for the shared five-tool
contract. Intent fields now use primaryReaction. Browser acceptance steps are in Art Direction.

## Delivered v0.7 integration and corrected presentation

App retains singleton services, one Timer lifecycle, workflow-aware Review
maintenance, one application read binding, one route adapter and one load-only
Experience bridge. The bridge coalesces saved/live notifications and never
reaggregates history per display tick. SceneArtwork is unchanged temporary SVG.

Workspace and message visibility are separate presentation state. App retains
Task/Review drafts, Task editor subview, Focus selection/durations/view, read
periods, and pagination/subview choices across promotion/demotion. Full-workflow
unmount clears destructive confirmations; explicit Save/Cancel clears editors.
Disappeared Tasks retain draft fields and block saving. Frozen Timer retries remain.

Direct tool hashes hydrate that tool in Primary with empty Aux slots. First tool
opening, promotion or a Primary-changing swap pushes its hash. Aux opening,
replacement, closing, activity and Aux-to-Aux moves write no history. Closing
Primary replaces the hash with its promoted successor (or root if empty).
Collapse replaces root; Reveal does not write. Back/Forward selects only routed
Primary: current Aux composition remains, a routed Aux swaps with Primary, a
closed destination replaces Primary; it never reconstructs historical layouts.
Root/unknown/Profile navigation clears tools; unknown/Profile canonicalize to #/.

Compact Review has no workflow commands, including no Retry that performs Review
settlement. Explicit Primary entry opens existing workflow. App-level safe/date/
focus/save maintenance remains independent of summarization. Compact Focus has
Pause/Resume only; Start/Reset/target/durations remain in Primary. Tool movement
never reconciles Timer state or creates records.

No dependencies, schema/migration changes, durable scene state, final art or
Message Board were added. The corrected architecture passed user visual review;
the subsequent baseline motion still requires browser acceptance. Automated
structural tests are not pixel or browser acceptance.

## Delivered baseline motion contract

Motion is calm, responsive and non-elastic: 120ms fast/exit, 180ms standard enter,
220ms spatial movement, with shared enter/exit/move easing in scene-local CSS.
Drawer launchers fade/slide from the right and reverse on hiding; final positions
and DOM order remain fixed. Circular launchers are 48px with restrained hover,
press, active and visible-focus states. Primary and Compact receive slightly more
vertical breathing room without scrolling or changing the composition budget.

Tool-keyed outer surfaces retain identity across slot changes. Local FLIP animates
old-to-new rects; density changes crossfade frozen outgoing paint with live new
content. Removed workflows unmount immediately: their visual exit is an inert,
aria-hidden, disabled DOM copy with no handlers/effects or IDs. Fourth-tool
replacement fades the outgoing Aux before incoming paint. Visual cleanup uses
completion plus a bounded fallback, and cancellation on disposal. Focus/routing/
business semantics never wait for animation. Fast repeated actions remain valid.

Drag subdues the source and shows a title/material ghost, with no form controls.
Refs/requestAnimationFrame update pointer transforms and valid target highlighting
without App rerenders or writes. Drop commits the existing slot swap immediately;
cancel changes no assignment. The ghost fades away, and real surfaces use normal
slot motion. Arrange/Promote remains available without dragging.

The independent MessageStrip fades/slides on reveal/collapse/restore and retains
its own small restore control. Drawer state never controls message state. No
history/board/queue is introduced. Reduced motion removes travel, scale, stagger
and flourishes; pointer following remains functional and immediate. Accessibility
state and semantic focus change immediately, including during exits. The system
is baseline only; production art will retune it. Never animate the scene camera.

## Reserved future media and resource boundary

Future Media Surface/mini-player is independent of CompanionMessage and consumes
no functional slot. It may live below the workspace at about 1.5 Aux widths; its
height is not required to be smaller than Aux. Final dimensions follow content
and scene budget. Cover art, title, playback/progress controls and a lightweight
level/equalizer are later scope. Prefer actual playback/analyser data where
appropriate. No media placeholder, audio engine, visualization or storage now.

First music delivery prefers user-imported local audio or app-provided audio/
ambience. Do not scrape/control Bilibili, browser tabs, third-party desktop music
apps or arbitrary system media sessions. Desktop/Tauri OS APIs may be evaluated
separately later. Future Message Board expansion may use the bottom region but
remains deferred: no history persistence, chat, LLM or Agent now.

Art assets cover environment/room/window, Companion/cat, props, expressions,
steam/light and decoration. Functional surfaces remain HTML/CSS: cards, buttons,
tabs, forms, selectors, pagination, targets, labels, dynamic text and progress.
Do not turn functional tools into baked image assets.

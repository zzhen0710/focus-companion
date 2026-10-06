# Approved Art Direction and Prototype Boundary

Status: isolated v0.6 composition/interaction prototype implemented; browser
acceptance pending. The production v0.5 app has no Companion. Production
integration belongs to v0.7 and requires separate approval.

## Composition

The Companion is the unique major intentional focal subject and persistent
visual/emotional anchor. The environment supports it. Use scale, placement,
composition, contrast, whitespace, and restrained utility UI rather than a rigid
screen percentage. The first impression should be a companion sharing a space.

One persistent scene is preferred. Keep utilities near edges/corners where
practical; a panel must not visually replace the Companion. Avoid permanent
large panels surrounding a small decorative character or competing analytics
cards. Dense content must still be readable and usable on narrow screens.

The top-edge, preferably upper-right, Global UI Handle remains visually minor:
a tiny stationary, quiet scene-integrated mark with vertical reveal/collapse
meaning and a larger accessible
interaction target. Follow [Experience Contracts](experience-contracts.md) for
immersive / utility-ready / active-panel behavior and dismissibility.

## Approved post-v0.6 production visual direction

The selected direction is a human anime-inspired Companion as the strongest
intentional focal subject, generally left/center-left, in a warm nighttime study
room. A sleeping cat provides secondary companionship. Use lavender/mauve as a
base, cream/amber warm light, cool moonlight blue, and restrained natural green
accents. Do not make the scene monochrome purple. Include thin visible steam
from a warm drink; restrained haze/soft focus belongs only at the outer edges.

Protect the Companion face, hands/meaningful pose, cat, and important desk
interaction area from UI obstruction and blur. Use these art regions together
with CSS-authored UI anchors/layouts, not a generic collision solver. Defer
per-scene metadata until a second real scene demonstrates a need.

The window/night view supplies atmospheric depth and may sit near the
Companion/UI boundary. Controlled tonal variation supports translucent UI;
brightest moon/reflections must not sit directly beneath important text. The
window must never rival the Companion as focal subject. No coordinate is fixed.

Default glass should use CSS: neutral dark translucent base, restrained
lavender/mauve tint, subtle glow, thin border, soft shadow, rounded corners,
modest backdrop blur, and readable opaque fallback. Never lower opacity on an
entire content subtree. No visual library is currently justified. Subtle outer
vignette, limited haze, and optional foreground depth are peripheral treatments,
never whole-app/root, face, or functional-text blur or readability loss.

Concept art is a visual north star, not a literal specification. Exact character,
outfit, room-object density, timer ring, card coordinates, typography, skyline,
and generated UI copy remain unapproved implementation details.

Preferred conceptual production layers, from back to front:

1. Room / distant window.
2. Background lighting.
3. Rear furniture.
4. Companion body / expression parts.
5. Desk / hands / contact props.
6. Sleeping cat.
7. Drink steam / local light.
8. Optional foreground depth.
9. HTML/CSS UI.

This describes ownership/composition, not an asset system or rendering engine.
Layered 2D / 2.5D remains the preferred direction to evaluate.

## Rendering direction remains open

Candidate approaches are 2D, layered 2D / 2.5D, Live2D-like systems, and 3D.
Prototype layered 2D / 2.5D first: it may balance Web suitability, independent
development cost, authored visual quality, and manageable animation complexity.
This is not a final rendering-stack, library, tooling, or asset-pipeline decision.

The prototype should help answer:

- Does the silhouette, scale, and framing establish unique Companion dominance?
- Does environment detail support that subject without competing?
- Do panel placement/size and contrast keep content legible without dashboard dominance?
- How does the scene adapt to narrow screens and text zoom?
- Are the few factual state expressions clear with reduced or disabled motion?
- Is one polished default Companion/environment feasible to author and maintain?

## One isolated v0.6 prototype

Use one representative Companion and environment with fixtures. Validate:

- Companion scale, focal dominance, framing/camera, and environment composition.
- Handle placement, usable target, and edge/corner utility placement.
- Immersive, utility-ready, and active-panel compositions.
- Reveal/collapse and one-active-panel interactions.
- Panel size relative to the Companion and dense-content readability.
- Desktop and narrow-screen layouts, keyboard focus, and reduced-motion behavior.
- A few factual state-expression examples from Experience Contracts.

Prefer fixtures and isolated entry/composition. Do not connect the prototype to
production storage/service bootstrap if that risks modifying real user data.
The prototype validates direction; it does not replace the production shell.

No final art, many characters, multiple rooms, large animation system, full
personalization, or large asset library is required. Do not copy other products'
specific characters, art, rooms, music, animation, or UI. Final production assets
remain undecided. Prototype acceptance steps are below.

## Version boundaries

v0.6 establishes contracts, Art Direction, and the isolated prototype. Sound and
media direction may be considered only enough to avoid boundary conflicts;
there is no audio engine, media library, day/night engine, theme/skin store, or
large asset pipeline in this stage.

v0.7 delivers one polished default nighttime study scene and human Companion,
a secondary sleeping cat, practical static steam/lighting, production Main Scene,
and a tiny stationary global handle. Exactly five launchers (Focus, Tasks, Review,
History, Insights) integrate existing tools with at most one primary functional
card and zero to two lightweight auxiliary bubbles. The count is a hard cap, not
a target. Include a small deterministic expression set, one default readable
glass material, and route compatibility. Collapse hides cards/bubbles/launchers;
immersive has only scene, Companion, and handle. Priority/drag are not prerequisites.

v0.8 primarily adds music/ambience, completion sound/mute/volume, richer behavior,
day/night treatment, local image/video backgrounds, controlled appearance,
personalization, configurable glass/visual presets, a broader expression catalogue,
and related preferences/reliability. Formats, limits, storage,
skin scope, and final assets remain undecided. Preserve optional/reducible motion
and sound, the calm usable default, and the core image/video beta deadline no
later than v0.9. Customization supports focus rather than becoming the focus.

## Superseded production assumptions from the v0.6 prototype

| Prototype choice | Approved future production contract |
| --- | --- |
| Six launchers including Settings placeholder | Exactly Focus, Tasks, Review, History, Insights in v0.7 |
| Fixed three-column launcher grid | Roughly two to three shared authored state-specific layouts |
| Rectangular Global UI Handle | Tiny stationary edge-adjacent mark; exact ornament open |
| Daylight/vector study scene | Warm nighttime anime-inspired human Companion with secondary sleeping cat |
| Current card dimensions | Bounded overlays validated for production art/content/viewports; no fixed inherited dimensions |

Keep bounded scrolling, prototype isolation, factual-context availability,
read/write service separation, draft retention, destructive confirmation clearing,
conservative timer behavior, and one-primary-card discipline. Historical prototype
details below describe actual delivered code, not requirements to reproduce it.
Knowledge is not a v0.7 launcher or required v0.8 capability; PRODUCT/ROADMAP
preserve its separate deferred approval, independent from LLM/Agent decisions.

## Delivered prototype

The manual visual review rejected the initial woodland mascot direction. The
revised `PrototypeScene.tsx` contains original temporary SVG artwork of an
anime-inspired human girl with chestnut tied hair, sage overshirt, cream blouse,
and plum trousers, seated at a wooden study desk. A curtained window, soft natural
light, notebook, lamp, plant and subdued reading corner establish a shared indoor
space. Background, chair, companion, foreground desk and hands create depth.
The attached study-companion reference informed only broad atmosphere/hierarchy;
its character, room, furniture arrangement, distinctive objects and UI were not
reproduced. No external assets/fonts or rendering dependencies are used.
Eye/gaze/hand detail follows factual intent, never inferred mood. Unknown stays
neutral; interruptions do not produce sadness. A restrained breathing loop and acknowledgment entrance are
disabled by `prefers-reduced-motion`. Final art/animation technology remains open.

The scene is a fixed `100svh` composition with an absolutely positioned SVG layer.
Utilities are absolute overlays and never contribute to scene height or framing.
Desktop launchers/card use a 320px width, capped by viewport width. Every panel
shares a rounded flex-column card, capped at `min(480px, 58svh)` and further
constrained by available space below the handle/launchers/error. The header does
not shrink or scroll; content alone scrolls with `min-height: 0` and overflow-y.
Insights retains its dense metrics and seven-day rows rather than removing content
to fit. Opening/closing/switching cards cannot alter the scene's layout dimensions.

At widths up to 720px, the centered scene crop retains the human companion while
the card overlays the lower scene with 12px edge clearance and a cap of
`min(420px, 44svh)`. Launchers stay near the top; the lower utility stack reserves
their space. Short landscape/zoom viewports use the remaining height below those
controls. Errors are separately bounded/scrollable; only utility descendants
accept pointer input in the mobile overlay. Dense History/Insights samples test
readability rather than provide working analytics. The prototype has its own
root/stylesheet and imports no production feature CSS. Composition quality and
small-screen framing still require visual acceptance; no browser screenshot
review is claimed during this implementation.

The handle has a 76×48px button around a 56×23px mark, visible focus,
Show controls / Hide controls labels, expanded state and controls association.
Hidden launcher/panel contents are unmounted. Opening/replacing a panel focuses
its heading; closing focuses its launcher; collapse focuses the handle. Opening
a confirmation focuses Confirm; dismissing it returns to its request button.
Escape clears confirmation, then closes panel, then collapses utilities. Native
buttons support Enter/Space; native selects retain their own Escape handling.
Timer output explicitly has no live announcements. These implemented behaviors
need real browser/assistive-technology acceptance.
Scrollable card content is a labelled, keyboard-focusable region, so users can
reach it and scroll long content without moving the scene. Existing handle,
draft, confirmation, one-panel, Review and error semantics remain unchanged.

## Browser acceptance checklist

Run `npm run dev` (`npm.cmd run dev` if PowerShell blocks npm.ps1). Use Vite's
printed port for `/` (unchanged production) and `/prototypes/main-scene/?lab=1`.
The development server and both entries were verified by HTTP; typecheck/lint,
324 tests across 27 files, and normal production build passed. The available
browser-control inventory was empty, so the following browser checks are pending,
including console/storage observation. They are not reported as performed.

1. Open `/`, confirm the familiar production navigation/tools still work; stop
   any production timer before measuring prototype storage isolation.
2. Open the prototype without `?lab=1` to judge composition without lab UI.
   Reveal: launchers only. Open Focus, switch to Insights, toggle Insights again:
   exactly one panel or none. Compare the companion's position/scale before and
   after opening cards: the scene must not resize or reframe. Scroll dense Insights
   inside its compact card; the header remains visible and the room stays fixed.
   Close leaves launchers; Hide removes both; Reveal
   does not restore a previous panel.
3. In Tasks, enter a draft. Switch to Insights/back, then Hide/Reveal/Tasks;
   text remains. Request sample deletion, then switch/Close/Hide and reopen;
   confirmation does not return. Confirm affects only a local fixture message.
4. Use Tab/Enter/Space; check visible focus and no hidden utility tab stops.
   Check panel-heading focus on replacement, launcher focus on Close, handle
   focus on Hide. Press Escape three times from a confirmation: confirmation,
   panel, then utility layer. Check native select popup behavior separately.
5. Add `?lab=1`. Select idle, focus-running, focus-paused, break-running, and
   unknown-timer. Inspect factual presence and Focus text, including pending
   completion/reset without new saved history; renamed/deleted targets preserve
   captured titles while showing changed/missing current identity.
6. Reload idle: old completion baseline stays silent. Commit Focus once: one
   acknowledgment/reaction count. Refresh same facts/ticks do not increment it.
   Reload idle and Commit both: Focus wins, no later Task replay. Wait past the
   10-second cooldown for an independent new candidate. Interruption is neutral.
7. Select review-pending: a quiet cue/launcher indication, no panel auto-open.
   Open Review intentionally; dismiss and confirm no repeated ambient offering
   during that page session. A fresh page resets only in-memory rule memory.
8. Fail saved read while collapsed: subtle handle attention. Reveal: error,
   retained/stale facts and Retry. Recover: no replay. The load-failure scenario
   also retains previously loaded facts as stale, never zero. Initial unavailable
   saved-data recovery is covered by coordinator tests. Advance to midnight and inspect local date,
   day phase and Today focused; Advance 31 seconds checks expiry.
9. Inspect immersive, History and dense Insights at desktop, 390px and 320px,
   then 200% browser zoom. Check companion framing, readable text, no clipped
   controls or horizontal overflow. Enable reduced motion: no breathing/entrance
   animation; factual meaning remains legible. Restore test browser settings.
10. In browser devtools compare all localStorage/sessionStorage keys/values before
    and after prototype scenario/Retry/draft/confirmation interactions (with no
    other production page writing). Expect no changes. Check console for errors.

The lab sits below the scene, separate from its composition. Scenarios/events,
drafts, selection, reference-time offset and rule memory are in-memory only and
reset on reload. Timer fixtures use existing calculations but do not execute a
working timer controller or save sessions. No production integration, Priority,
drag/reorder, Settings implementation, audio/media, personalization, or schema
work is delivered here. The normal production build excludes the prototype HTML
and artwork; production source/config/package/lock files remain unchanged.

# Approved Art Direction and Prototype Boundary

Status: v0.7 Checkpoints A-E are production-integrated with temporary structural
scene artwork. Corrected structure passed user visual review; baseline UI motion
is implemented with motion browser acceptance still pending. Final art/polish remain pending.
v0.7 is not complete. The isolated v0.6 prototype remains a fixture study.

## Composition

The Companion is the unique major intentional focal subject and persistent
visual/emotional anchor. The environment supports it. Use scale, placement,
composition, contrast, whitespace, and restrained utility UI rather than a rigid
screen percentage. The first impression should be a companion sharing a space.

One persistent scene is preferred. Keep utilities near edges/corners where
practical; a panel must not visually replace the Companion. Avoid permanent
large panels surrounding a small decorative character or competing analytics
cards. Dense content must still be readable and usable on narrow screens.

The right-edge Tool Drawer has a tiny stationary circular/soft mark with a larger
usable native-button target. Left reveals tools; right hides them toward the
edge. Five circular launchers remain fixed. BubbleWorkspace changes slot
assignment, never launcher layout or scene framing. CompanionMessageStrip is a
separate narrow bottom element with its own collapse control.

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
and a tiny stationary right-edge horizontal Handle. Exactly five launchers
(Focus, Tasks, Review, History, Insights) remain fixed. The three-slot functional
workspace has one richer Primary above two intentional Compact tool views;
expression belongs to the independent bottom MessageStrip, outside that budget.
No functional bubble relies on internal vertical scrolling. Use focused subviews
and pagination, not miniature pages. Slot dragging snaps to authored positions,
with accessible Arrange/Promote alternatives. No final-art acceptance is claimed.

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
| Fixed three-column launcher grid | Stable circular launcher rail; tool-independent positions |
| Rectangular/vertical Global UI Handle | Tiny stationary right-edge mark; horizontal left/right semantics |
| Daylight/vector study scene | Warm nighttime anime-inspired human Companion with secondary sleeping cat |
| Current card dimensions | Bounded overlays validated for production art/content/viewports; no fixed inherited dimensions |

Production internal scrolling is superseded by focused no-scroll views. Preserve
prototype isolation, factual-context availability,
read/write service separation, draft retention, destructive confirmation clearing,
conservative timer behavior, one Primary and at most two functional Aux slots. Historical prototype
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

## Isolated prototype browser acceptance checklist

Run `npm run dev` (`npm.cmd run dev` if PowerShell blocks npm.ps1). Use Vite's
printed port for `/` (production Main Scene) and `/prototypes/main-scene/?lab=1`.
During v0.6, the development server and both entries were verified by HTTP; typecheck/lint,
324 tests across 27 files, and normal production build passed. The available
browser-control inventory was empty, so the following browser checks are pending,
including console/storage observation. They are not reported as performed.

1. Open `/`, confirm the production Scene and business tools work; stop
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
working timer controller or save sessions. This isolated prototype delivers no production integration, Priority,
drag/reorder, Settings implementation, audio/media, personalization, or schema
work is delivered here. The normal production build excludes the prototype HTML
and artwork. Its v0.6 implementation left production source/config/package/lock
unchanged; the separate v0.7 integration now changes production presentation.

## Production-art export handoff

The current production SceneArtwork.tsx is deliberately simple SVG geometry in
an authored 1600 x 1000 structural canvas. It verifies ordering, registration and
responsive anchoring, not final anime illustration quality. The chosen concept
remains a north star, with no exact character/outfit/coordinates copied.

For final art, recommend a common 2560 x 1440 master with crop allowance. Re-register
all layers together when replacing the structural canvas; do not stretch partial
exports independently. Keep full master coordinates or supply each tight export's
bounds/offset on that master. A still reference composite must demonstrate desk,
hands/pen/book contact and all four facial overlays. Art source/provenance should
be retained outside the runtime export set; large editable sources need not enter
Git. Optimized local exports enter src/scene/assets/night-study/ at the next gate.

| Required export | Format / alpha | Approximate bounds | Registration / variants / crop |
| --- | --- | --- | --- |
| Room + distant window + background light | Opaque WebP | Full 2560 x 1440 master, with overscan if needed | One night scene; crop-safe subject/UI background, moon/reflections outside important text |
| Rear furniture | Transparent WebP/PNG, or merge into room | Master-aligned useful bounds | Static; remains behind body, may crop at edges |
| Companion body/torso/hair | Transparent WebP/PNG | About 1100 x 1200, relative to master | Static contact-preserving pose; protect head/face, no different registration per state |
| Desk + contact props | Transparent WebP/PNG | About 2560 x 600 lower region | In front of torso, below hand overlay; preserve pen/book/cup contact anchors; edges may crop |
| Hands/contact overlay | Transparent WebP/PNG | About 800 x 400 tight region | Shared wrist/desk/prop anchors; no pose movement in this pass; do not crop meaningful contact |
| Expression overlays: neutral, working, paused, break | Four transparent WebP/PNG exports | About 500 x 400 facial bounds each | Identical bounds/offset/eye anchors; unknown reuses neutral; acknowledgment needs no extra art; face stays crop-safe |
| Sleeping cat | Transparent WebP/PNG | About 550 x 260 | One static pose registered to desk/contact plane, subordinate to human; no behavior system |
| Drink steam/local-light treatment | Transparent SVG or WebP/PNG, may split only if necessary | About 250 x 400 steam bounds plus local light mask | Thin cup-anchored static treatment; no rich atmosphere engine |
| Peripheral depth/vignette guide | Optional transparent WebP/PNG or CSS mask | Full master edge regions only | No alpha/blur over face/text/hands/cat; can remain authored CSS without an image export |

These are approximate sizing recommendations, not locked design coordinates.
Room/light/rear furniture may be one export when static composition preserves
occlusion. All character/contact overlays require transparent backgrounds.
Prefer cropped alpha exports over many full-canvas layers. Aim initially around
3 MB compressed scene assets, then measure decoded memory and browser load/jank.
Preload the room/neutral subject; load and decode alternate expressions before
swapping. No pipeline, registry, LFS, remote asset service or engine is introduced.

## Corrected production presentation and acceptance boundary

The previous scrolling Primary card plus expression Aux interpretation is
superseded. Production has a stable circular right-edge launcher rail, three
functional slots, explicit Primary/Compact densities, and an independent current
message strip. Primary is relatively wide and horizontal above two lighter Aux
surfaces. The workspace aims at about 30% desktop width and 60% height; these
are composition targets, not a clipping mechanism. Actual geometry needs browser
review against final art. Controls use circles, pills and large radii.

The temporary SVG artwork is unchanged. Artwork/face/contact/cat protection,
registered exports and final-art requirements above remain valid. No final art
was generated/imported. Final production-art integration remains a separate gate.

Current CSS hides Aux and optional messages at width <=760px or height <=700px,
retains slot state in memory and exposes a Primary selector for hidden open tools.
Drag grips are hidden there; keyboard/explicit Arrange remains available. Compact
views remove secondary controls rather than shrinking full pages. No functional
bubble defines overflow-y auto/scroll; long content is paginated/subdivided.
Native text editing can scroll its user-entered text, not a feature-page container.

The corrected structure passed user visual review before the motion pass.
Motion acceptance still required: right-edge reveal/hide; stable named
launchers; open-order/oldest-Aux replacement; most-active promotion on close;
three-slot balance; primary/compact distinctions; no internal functional scroll;
Promote/Arrange/drag snap and cancel; independent message collapse; unchanged
scene framing; drafts and confirmation clearing; Review Aux safety; Timer across
movement; error recovery; 390px/320px/short landscape/200% zoom/reduced motion.
Message Board/history/chat is deferred. No v0.7 visual release acceptance yet.

## Baseline motion and resources

The current production UI has shared 120/180/220ms tokens, gentle enter/exit/move
easing, drawer/launcher reveal/hide, small hover/press/focus responses, bubble
presence, tool-keyed FLIP, density crossfade, replacement sequencing, a lightweight
pointer ghost/target highlight and independent message collapse/restore. Primary
has more padding/material hierarchy; Compact stays reduced. Launchers are 48px.
First Aux opens lower-right, next lower-left; no opening-side preference is saved.
The workspace still aims around 30% desktop width and 60% height, without internal
vertical scrolling. Reduced motion removes spatial/scale flourish. This is a base
system, not final polish; retune durations/spacing against final art.

Do not animate the temporary SVG Companion/cat/room. Dedicated production assets
may later support blink, breathing, hair/writing hands, cat/steam/light/atmosphere.
Room/window, Companion, cat, desk props, expressions, steam/glow and decoration
belong to art assets. Cards/buttons/tabs/forms/selectors/pagination/drag targets,
labels/dynamic text/progress remain HTML/CSS. Decorative textures/icons may be
assets, but functional bubbles must not be baked images.

Reserve a future independent Media Surface below the workspace, separate from
MessageStrip and outside the functional slot budget. About 1.5 Aux widths is an
approximate reference, not a fixed size. Height is not constrained below Aux;
content/composition decides it. Later cover art/title/playback/progress and a
lightweight real-data level/equalizer may occupy this surface. Respect scene
budget. No visible placeholder, audio/visualization or final media artwork now.
First music implementation should prefer imported local or app-provided audio/
ambience; external-player control/scraping is deferred. Future desktop/Tauri OS
media integration requires separate evaluation. Message Board remains deferred.

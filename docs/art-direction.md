# Approved Art Direction and Prototype Boundary

Status: approved pre-v0.6 direction only. No prototype or production Companion
exists in the current v0.5 app. Implementation planning approval precedes the
v0.6 prototype; production integration belongs to v0.7.

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
a quiet long flat rectangle with vertical chevrons and a larger accessible
interaction target. Follow [Experience Contracts](experience-contracts.md) for
immersive / utility-ready / active-panel behavior and dismissibility.

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
specific characters, art, rooms, music, animation, or UI. Final assets and exact
prototype acceptance criteria remain implementation-planning decisions.

## Version boundaries

v0.6 establishes contracts, Art Direction, and the isolated prototype. Sound and
media direction may be considered only enough to avoid boundary conflicts;
there is no audio engine, media library, day/night engine, theme/skin store, or
large asset pipeline in this stage.

v0.7 delivers one polished default Companion and scene, production handle and
launchers, one active panel integrating the existing tools, a small deterministic
expression set, and useful route compatibility. Priority/drag enhancements are
not prerequisites.

v0.8 primarily adds music/ambience, completion sound/mute/volume, richer behavior,
day/night treatment, local image/video backgrounds, controlled appearance,
personalization, and related preferences/reliability. Formats, limits, storage,
skin scope, and final assets remain undecided. Preserve optional/reducible motion
and sound, the calm usable default, and the core image/video beta deadline no
later than v0.9. Customization supports focus rather than becoming the focus.

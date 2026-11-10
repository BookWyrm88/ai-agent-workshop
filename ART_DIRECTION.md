# Nocturne headquarters art direction

This visual revision uses the reference for mood and spatial intent, not as a copied application asset. The room plate and operator strip were generated with the built-in image-generation tool. No API key or CLI fallback was used.

## Saved assets

- `dist/assets/nocturne-room.png`: original 1536 × 1024 architectural environment, with an open central floor and no agents or baked-in central desks.
- `dist/assets/nocturne-operators.png`: original 1536 × 1024 RGBA operator strip. Transparent corner/gutter pixels were checked. Three silhouettes correspond to existing round, square, and cat appearance choices; identity IDs and colors remain unchanged.

The reference image, user attachments, and local generated-image account paths are not included in the repository.

## Interactive composition

`dist/headquarters.js` places individual HTML operator buttons, chair layers, SVG desks, nameplates and status indicators on a shared perspective floor. Back-row workstations are smaller; foreground workstations have larger scale. Vacant desks open the existing creation flow. Additional rows extend the room for larger teams. The room remains scrollable and respects the existing zoom control.

Task states drive breathing, working posture, keyboard/display pulses, waiting and failure indicators. There is no fabricated progress percentage or autonomous movement. Recorded messages use the same explicit workstation anchors for their paths and inspector controls. Reduced-motion CSS preserves all state labels and interaction without animation.

The surrounding UI now uses graphite rather than navy. The room fills the main Workshop width, with the functional task console directly below it and an explicit Open task console shortcut. Spectrum and Forest continue using their original renderers.

## Generation prompts

### Architectural plate

Use case: stylized-concept. Asset type: original background environment plate for an INTERACTIVE 2.5D anime-cyberpunk agent headquarters web application. Generate a richly painted cinematic wide landscape 1536x1024 illustration, NOT a screenshot or interface. Elevated three-quarter frontal camera looking down into an adult, sophisticated graphite-black research loft. Visible depth: rear wall windows across upper third look onto a rainy futuristic city, violet and cyan signage in distance, muted reflections; charcoal industrial beams, amber hanging task lamps, dark oak/black steel materials. Peripheral architectural detail: left side small leather lounge and bookshelves with plants, right side glass partition with subtle illuminated technical equipment, near foreground edges low sofa backs and a plant framing scene. Crucial composition: the broad CENTRAL FLOOR from x22%-85%, y42%-88% must be EMPTY open dark tiled floor, clear of people, desks, chairs, furniture, text or screens, so actual interactive operator stations can be placed there by code. Strong perspective floor grid and very subtle amber/magenta/cyan light reflections, paths/zones suggested naturally. Rich spatial depth and moody adult noir, near-black/neutral charcoal dominates, NOT navy. Hand-painted high-end anime background with detailed natural materials, cinematic but restrained pools of light. No people, no characters, no desks in central floor, no UI, no labels, no logos, no words, no watermark. This is a unique new room inspired by general neon-noir atmosphere, not a copy of any reference.

### Transparent operator strip

Use case: stylized-concept. Asset type: transparent CHARACTER SPRITE STRIP for a functional anime-cyberpunk office web application. Create three distinct adult operators side by side on a genuinely transparent canvas, each in an equal-width vertical column, fully separated with generous transparent gutters and no overlap. Wide 1536x1024 composition. All three shown from head to hips SEATED leaning forward at an invisible workstation, three-quarter frontal perspective seen slightly from above, hands forward typing on an invisible keyboard at lower waist level; no desk, no keyboard, no chair, no scene. Left: adult male with short tousled black hair, subtle spectacles, charcoal tailored technical jacket with small teal edge accents, composed focused expression. Middle: adult androgynous operator with swept silver hair, rolled sleeves and charcoal fitted utility jacket, tiny amber hardware accents, thoughtful mature face. Right: adult woman with dark plum hair in high ponytail, graphite technical jacket, tiny violet seam accents, intelligent serious expression. Restrained mature anime illustration, cinematic painted shading, elegant facial proportions, realistic fabric folds, warm skin, no chibi and no oversized eyes. Main clothing is neutral graphite and black, subtle side cyan/magenta rim light. Match a sophisticated nighttime research loft. Full heads, arms and torsos stay within each column; hands visible. All figures same scale and baseline, centered at exactly 1/6, 1/2, 5/6 of canvas width. Transparency everywhere outside the figures. No background shadows, no props, no floor, no text, no UI, no watermark.

## Verification limit

Generated artwork was inspected and transparency checked. Functional tests cover the real interface code and the geometry anchors. Automated browser access to the user-opened local-file preview is blocked by the browser URL policy; no rendered browser screenshot or full visual accessibility verification is claimed. Reload the review HTML in a normal browser to inspect the complete composition.

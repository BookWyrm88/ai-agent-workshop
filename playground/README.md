# Moss Animation Playground — 0.1.0

An isolated, interactive character-animation rehearsal for AI Agent Workshop. One operator, a workstation and a couch. No AI requests, API keys, saved workspace reads, or storage writes.

## Open and try it

Open `release/Moss Animation Playground - 0.1.0.html` in Chrome or Edge. Everything is embedded: no installation, server or internet connection is needed to run that file. Use a browser with WebGL2/graphics acceleration available.

Moss starts seated and typing. Select **Move to Lounge**, wait for **Resting**, then select **Return to Workstation**. Repeat as often as desired. **Full demonstration** makes one round trip with a five-second rest. **Reset** safely cancels movement and returns to the initial pose. **Pause**, **Half speed** and **Character close-up** help inspect the motion.

Reduced-motion preferences automatically disable incidental blinking, breathing, typing variations and resting gestures. Essential user-requested walking and seat transitions remain visible; Pause stops all rendering and animation. Hidden tabs do not advance the simulation. The renderer is capped at 30 frames per second and a 1.6 device-pixel ratio.

## Source and development

Development branch: `feature/moss-animation-playground`, based on `9e9069b`. The implementation lives entirely under `playground/`. Production files and the `v0.1.0-rainbow` tag are unchanged. Nothing has been merged, pushed or deployed.

From this directory, with Node.js installed:

```text
npm ci
npm start
```

Open `http://127.0.0.1:8787`. The development server bundles the current source in memory. To produce the single downloadable file, run `npm run build`. This builds only the playground, not the production Workshop.

```text
npm test
npm run test:visual
node tests/standalone.cjs
```

Browser tests use installed Windows Chrome by default; set `CHROME_PATH` for another Chromium executable. The standalone test requires a build first. `node tests/record.cjs` captures the complete demonstration, and `node tests/check-recording.cjs` extracts review frames from it. Generated release files and dependencies are ignored by Git; source and review evidence are versioned.

## Architecture decision

Selected: lightweight articulated 3D using **Three.js 0.187.0**. This gives a consistent view of the same body during turns, explicit furniture depth, and fixed-length limb chains that bend at joints. A 2D rig would require additional artwork for different directions and seated poses; sprites would require an authored frame library for every appearance. Three.js lets this milestone test the entire movement with one reusable character construction.

This is a procedural joint hierarchy with authored pose transitions and two-link leg inverse kinematics. It is **not** a production skinned anime model or a motion-capture animation pack. Geometry, hairstyles and garments are attached to named body groups; a future authored model can replace the geometry without replacing the movement controller. The current visual style is a simplified 3D interpretation and is substantially less detailed than the painted reference. Character art and motion quality still need user approval.

| Layer | Responsibility |
|---|---|
| `src/adapter.js` | In-memory Moss identity and adapter to the existing Workshop spatial reservations/arrival API. |
| `src/motion.js` | Activity-to-animation state transitions, seat anchors, orientation, route and timing. No DOM or storage. |
| `src/character.js` | Connected torso/head/limb hierarchy, leg IK, stance-foot placement, typing, blink and resting pose. |
| `src/world.js` | Fixed/follow cameras, furniture, lighting and WebGL rendering. |
| `src/main.js` | Controls, activity labels, small movement log and frame loop. Updates do not rebuild the scene or page. |
| `build.cjs` | Reproducible standalone HTML from these sources; no second implementation. |

The unmodified `../dist/spatial.js` supplies zone reservations, occupancy and arrival events. The adapter projects animation positions into that model; the playground owns animation timing rather than using its original 1.6-second position interpolation. The synthetic identity is deliberately separate from saved agents. All task execution, configuration history, persistence, export/import, themes and navigation stay in the original application.

Later integration should mount this renderer once, feed it existing agent identities and task activities, and send spatial move intents through the adapter. Arrival should be committed when the animation settles, rather than on the old CSS timer. This integration is not included or authorized by this milestone.

## Libraries and assets

Runtime: Three.js, including its rounded-box geometry helper, under the MIT license in `THIRD_PARTY_NOTICES.txt`. Build: esbuild 0.28.2. Browser verification: Playwright 1.65.0. All are pinned in the lockfile. [Three.js documentation](https://threejs.org/docs/) describes the rendering and scene primitives used here.

Character and room geometry were created specifically for this prototype in code. No reference screenshot, remote model, font, texture, paid asset, CDN or network service is required. The standalone file includes the runtime license notice.

## Review boundary

This is an animation proof of concept, not the next Workshop release. The current Workshop still stores workspace data locally and its existing export/import backup functionality remains intact. This rehearsal stores nothing and refresh starts over. Review the prototype before replacing the production renderer or adding more agents.

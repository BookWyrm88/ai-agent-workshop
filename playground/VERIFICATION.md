# Verification — Moss 0.1.0

## What was checked

- Actual headless Chrome rendered the WebGL scene. Before substantial animation implementation, a browser screenshot smoke test established that rendering and screenshot inspection worked. The Codex in-app browser could not reach the loopback preview in this environment, so local Chrome automation was used instead.
- State/joint tests completed ten repeated round trips plus two minutes of resting, invalid commands, conflicting commands and reset. They sampled more than 20,000 stance-foot intervals: maximum straight-walk drift was below 0.003 world units, and ankles remained at least 0.089 units above the floor. Thighs and shins retain their 0.44-unit lengths.
- Browser controls completed five round trips, including the automatic demonstration, 60 seconds resting, reset during movement, reduced motion and occupancy/arrival updates. No local-storage writes or page errors were observed.
- Direct-file testing checks real-time playback, a round trip, automatic reduced-motion preference and zero external requests in the packaged HTML.
- Desktop (1440 × 1000) and narrow (390 × 844) layouts were captured. The narrow layout has no horizontal document overflow; controls stack below the scene.
- The Rainbow preservation script confirms that its seven original application files match the preserved release hashes. Production source is unchanged from the starting commit.

## Rendered evidence

`evidence/01-workstation.png` through `10-resumed.png` show seated working, face close-up, rising, fully raised/turning, walking, approaching the couch, lowering into the seat, resting, returning and resumed work. `11-mobile.png` shows the narrow layout.

`evidence/full-sequence.webm` records the complete demonstration from the same live controller and renderer. `12-recording-contact-sheet.png` contains sampled decoded recording frames. Capture advances the simulation at 24 steps per second; recording overhead can make the video slightly slower than normal interactive playback. It is evidence of the full sequence, not a performance benchmark.

Rendered stage images and sampled recording frames were inspected for face visibility, attached clothing, limb bending, orientation, foot level, seating and occlusion. This caught and led to fixes for hair covering the eyes, resting hands sinking into the couch, distracting lamp shadows and leg reach causing raised stance feet. A rendered sequence is available for the user's own continuous-motion review; sampled frames alone do not establish subjective animation quality.

## Limits and review items

- This is a simplified procedural 3D character, not the polished mature-anime art in Reference A. The architectural change and complete articulated sequence are implemented; visual-style acceptance remains a review decision.
- Turns use small stepping motions, and transitions into/out of a gait are authored approximations. Straight-walking foot contact is numerically checked; turning is not a general full-body foot-locking solver.
- Furniture positions and the clear route are authored for this room. This is not a general collision-avoidance or navigation system for arbitrary furniture arrangements.
- Sleeves and torso are connected rigid meshes with overlapping joint caps, not deforming cloth. The prototype does not include cloth simulation, finger IK or lip animation.
- Working and resting are animation activities only; there is no pretend task result or AI execution. Saved Workshop identities and history are not loaded into the rehearsal.
- Chrome on this Windows environment was tested. WebGL2 is required. Other browsers and hardware have not been exhaustively tested. The reduced-motion option retains essential movement requested through the controls.

Nothing was merged or deployed. Stop here for user review before any production integration.

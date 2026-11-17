# Robot headquarters · 0.4.0 review

[Open the interactive application](../../docs/index.html) · [View the rendered walkthrough](walkthrough.html) · [Benchmark samples](performance.json)

**Try it:** Pick Moss and run a sample task. Select Herman and assign another before Moss finishes. Send Elmyra to the lounge and back. Choose **Research → Evaluation**, select the two operators, then run the collaboration. Click the moving delivery’s **Inspect delivery** button or open the saved message in Laboratory later. To see the amber attention signal, enable approval for an operator in Task Queue and give it a new assignment.

## What drives the scene

- **Rendering:** Layered SVG heads, face displays, arms and feet share one design per configuration. CSS animates the relevant pieces: gaze and blink when idle, hands and monitor while working, alternating steps and hops in transit, folded feet at the lounge. A sprite atlas would require art for every outfit and activity. The layered renderer lets a saved color, helmet, accessory, chassis, symbol, eye style or trim change independently.
- **State:** Each active ID owns one persistent scene actor. The existing queue, run events, zone reservations, timed arrival and handoff records control the picture. Moving operators leave their assigned desk in place. The floor draws only a destination path and consumes its saved start time and duration; no physics or JavaScript frame loop is needed. Operators outside the scroll viewport pause decorative joint animation.
- **Signals:** Task bubbles quote recorded event labels, status bubbles describe a location or queue, amber bubbles identify human attention, and message bubbles name actual handoff endpoints. The selected operator panel shows the assignment or explanation. Recent signals and Laboratory retain details after transient bubbles expire. The communication arc uses a timed packet for a recorded delivery, not a simulated discussion between idle agents.
- **Isolation:** Intermediate task events update the live scene and selected activity lines. The broader app still rebuilds surrounding UI for navigation, structural commands and terminal updates, preserving the floor node and robot SVGs across same-view changes. This is a focused scene integration, not an application-wide rewrite.
- **What was retained:** The 3D experiment informed explicit movement phases and browser-based visual verification. Its meshes, IK, Three.js and WebGL runtime are **not** in the Workshop bundle. The separate playground remains unchanged. Previous human-style fields still survive import, editing and version history. The original Neon room artwork, spatial model, simulator, theme choices and educational tools remain.

## Verification

All nine existing functional suites passed, including legacy workspace migration, export/import deduplication and validation, configuration versions, independent concurrent runs, approval/held queue recovery, tutorial actions and skip controls, capacity/restore, handoff payload history, evaluations, and static Pages-path loading. A one-operator fixture tests migration independently of the new three-operator fresh workspace.

The real Chrome test opened the standalone file in an isolated profile, drove two simultaneous assignments, sampled actual animated arm transforms, and confirmed the floor and SVG node identities survived task updates and selection. It exercised two lounge round trips, a waiting approval, and the complete research → evaluator handoff, opened the Laboratory inspector, compared its payload to the sender’s result, and confirmed the record survived reload. It also checked reduced motion, a 390-pixel viewport with no document overflow, no page errors and zero external requests. Rendered screenshots were inspected for faces, desk overlap, paths, couch alignment, signal placement and message routing. The walkthrough contains the captured frames, not proposed designs.

## Performance

Review targets: standalone HTML below 4 MiB, inline JavaScript below 200 KiB, and 95th-percentile animation-frame interval below 33.3 ms in the local three- and twelve-operator scenarios. Both robot scenarios met those targets. The previous reference is the spatial review at commit `9e9069b`.

| Build / operators | Local load | Idle: main thread / 2 s | 3 tasks: main thread / 2 s | Active p95 frame interval | Active JS heap |
|---|---:|---:|---:|---:|---:|
| Previous / 3 | 416 ms | 165 ms | 335 ms | 17.1 ms | 2.1 MiB |
| Robots / 3 | 342 ms | 78 ms | 244 ms | 17.2 ms | 2.0 MiB |
| Previous / 12 | 409 ms | 191 ms | 440 ms | 17.1 ms | 1.9 MiB |
| Robots / 12 | 331 ms | 239 ms | 376 ms | 17.1 ms | 1.6 MiB |

The self-contained file fell from about **6.53 MB to 3.51 MB**, largely because it no longer embeds an unused human-operator image. Inline JS grew from about **153 kB to 172 kB**. Active main-thread time was lower in these samples; idle main-thread time at twelve operators was **higher**, so this is not a blanket performance improvement. These are single local headless-Chrome samples with synthetic records, in-memory navigation, no network downloads, and each build’s shipped event timing. Heap is sampled JavaScript heap, not total process memory. GPU utilization, battery draw, Safari/Firefox behavior and performance on other laptops were not measured.

## Limits and data safety

- Fixed lanes and reserved seats suit this floor; they do not solve arbitrary collisions. Operators can cross on the same aisle, and narrow screens pan within the room. When occupants share a zone, unselected bubbles can collapse; select the agent to see its full signal.
- The simulation extracts text and applies fixed evaluation checks. No LLM, external research, private reasoning display or autonomous conversations are implemented. Beginner/Advanced explanations do not change the execution engine.
- Storage remains local and unencrypted. Different file URLs or origins may show different workspaces. Export from the old address and import into this one when necessary. Imports merge new identities; they do not overwrite agents already present.
- The lab’s next evaluation iteration, general navigation/pathfinding and production deployment were deliberately left out. The preserved Rainbow release and separate Moss playground are unchanged.

Reproduce from the repository root: `npm test`, `npm run build:pages`, `npm run test:floor`, and `npm run measure:floor`. The browser checks use the already pinned Playwright in `playground/` and installed Chrome; development dependencies are not shipped to the user.

# Validation — Neon review

Run `npm run build:pages && npm test && npm run verify:rainbow`.

Tests use actual app/runtime code. Interface tests run in jsdom, not a rendered browser.

| Suite | Coverage |
|---|---|
| runtime | Deterministic extracts/checklists, decimals, instruction cues, disabled tools, failures, cancellation and events |
| ui | Independent Moss/Herman/third agent, concurrent execution, pause/resume, event-safe drafts, migration, all eight lessons through eleven real actions, scoring/comparison, retry/cancel |
| recovery | Every stage skippable, honest progress counts, help, Back/Exit/Resume, practice-only reset |
| management | Configuration versions, lifecycle, duplicates, queue ordering/cancel/dispatch, refresh without replay, actual payload consumed by evaluator, both histories, inspector/timeline, sessions, memory, extended backup round trip |
| themes | Default Neon, three adapters, independent persistent preference, unchanged workspace records, text palette contrast, depth rows, spatial handoff anchors, available-station controls, console focus and reduced-motion rule |
| edge cases | Legacy backup merge/deduplication, invalid ID rejection, 20-agent room structure, escaped names, 1,331 nameplate contrast samples |
| pages | Self-contained entry at a Pages repository subpath, initialization and export/import controls |
| preservation | Seven original tagged app assets match the existing SHA-256 manifest |

## Manual checks and limits

Source/data-flow review covers explicit dispatch, no automatic task replay, payload linkage, practice reset boundaries, local storage, snapshots, and excluded account/export files.

The server started, but the in-app browser reported `ERR_CONNECTION_TIMED_OUT` for its local address. No successful browser-rendered test is claimed. Desktop/mobile layout, animation alignment, keyboard traversal, and screen-reader behavior remain review items in REVIEW.md. Contrast checks cover selected palette pairs/nameplates, not full accessibility conformance.

No real provider, external tool, token accounting, persistent backend execution, or factual evaluation is tested or claimed. Fixed evaluator checks do not replace human review.

Visual-direction revision: generated room art was inspected, and operator alpha transparency was checked. Browser access to the open local-file preview is blocked by its URL policy. No alternate browser-control workaround was attempted; final rendered composition remains for user review.

# AI Agent Workshop — Neon review

A browser-local headquarters for agents, queues, collaboration, and evaluation. This is **0.2.0-neon-review** on `feature/neon-workshop`. It has not been merged or deployed. The preserved `v0.1.0-rainbow` tag remains unchanged.

## Open and review

Double-click **Open Workshop.cmd**, or open **docs/index.html** in Chrome, Edge, or Firefox. No installation or API key is needed. The separate **AI Agent Workshop - Neon Review.html** deliverable contains the same self-contained app.

For a local server, install Node.js 24 or later, run `npm start`, and open the printed address. Static hosting can use `dist/`; the GitHub Pages entry remains `docs/index.html` and works at a repository subpath.

**Export a backup from your current Rainbow app before moving data.** Open the review at its separate address and choose Import backup. Different paths, browser profiles, or sites may have separate storage. Keep the old Rainbow file and backup until review is approved. See [REVIEW.md](REVIEW.md).

## Implemented

- Tutorial recovery: Back, Next for already reviewed actions, Skip Step, Help, Exit, Restart, Resume, and persistent completed/skipped/unfinished records. Help explains prerequisites and highlights controls. Practice fixtures are separate; Reset Experiment removes only practice agents and their associated records.
- Agent Roster: search name/role/activity, filter lifecycle, reassign instructions/roles/document permissions, inspect and restore configuration versions, rest/archive/restore, and duplicate a configuration with a fresh identity/history and standard sample document. Finish or cancel active tasks before resting/archiving.
- Independent task queues: reorder/cancel pending work, hold/resume, pause/resume/cancel current work, retry as a new task, configuration snapshots, and history. Refresh cancels active work and holds pending assignments for explicit resume.
- Recorded collaboration: Research sends its actual output/source to Evaluation, which performs fixed checks. A route/packet in the room and persistent message buttons open an inspector with payload, IDs, timestamps, status, errors, and retries. Both agents' histories and the shared Laboratory timeline show the handoff.
- Sessions and intentional memory: fresh conversations, prior sessions, manual summaries, explicit context selection, and memory add/edit/delete. Selected context is captured in task traces; no automatic retention or token claims.
- Three shared themes: default Neon Noir with original SVG operator avatars, displays and a rainy city; retained Spectrum Studio; Forest Sanctuary with woodland scenery. Appearance persists separately from agents. Reduced-motion preferences are respected.
- Laboratory: original run inspection, human scoring, and comparison remain alongside queue transitions, shared events, and message inspection.

## Simulation limits and deferred work

No language model is connected. Document extraction recognizes a small set of instruction cues. Evaluation checks the received output using fixed rules, not independent reasoning or factual verification. Collaboration follows an explicitly selected workflow. Nothing executes while the page is closed.

Session context and memories are separated and recorded, but the extractor still reads its configured document. It does not interpret conversation context or retrieve memories semantically. Model limits, measured token usage, configurable token budgets, and reserved response capacity require a real provider and are not invented here.

Real providers/tools, backend scheduling, secure credentials, approval checkpoints, semantic retrieval, editable orchestration graphs, and evaluation datasets remain future integrations. Permanent agent deletion is deferred; archive/restore is available. No placeholder controls claim those features work.

## Data and privacy

The original `ai-agent-workshop.v1` key is retained. IDs, configurations, messages, runs, and evaluations migrate in place. Configuration history is seeded from historical run snapshots plus the current configuration; settings never saved by the old app cannot be reconstructed.

Records stay in this browser, unencrypted, subject to storage capacity. Export regularly. Backups contain documents, conversations, handoff payloads, memories, summaries, and configuration history; keep them private. Imports validate before merging new agents, preserve existing IDs unchanged, and hold imported queues. They do not replace existing agents or import tutorial progress/unsaved drafts into the destination. Refresh at the same address preserves progress.

Appearance uses a separate `ai-agent-workshop.theme.v1` key. See [PRIVACY.md](PRIVACY.md) for origin scope and font requests.

## Architecture and development

- `dist/engine.js`: provider boundary and per-agent event runtime; extraction and payload-driven evaluation.
- `dist/model.js`: migration, queue ordering, event records, configuration snapshots/version history; no UI or network dependencies.
- `dist/app.js`: views, dispatch, lifecycle/session controls, tutorials, validated backups, recorded communication.
- `dist/identity.js`: identity choices and shared room.
- `dist/themes.js` / `themes.css`: appearance adapters and scoped themes, separate from agent data.
- `scripts/build-pages.cjs`: packages the same source into self-contained `docs/index.html`.

Run `npm ci`, `npm run build:pages`, then `npm test`. `npm run verify:rainbow` checks the original tag, not changed working files. Run `npm run audit:staged` before any public upload. See [VALIDATION.md](VALIDATION.md) and [PUBLICATION_AUDIT.md](PUBLICATION_AUDIT.md).

A real runtime needs server-side credentials, permissions, durable scheduling and storage. GitHub Pages can host this interface but cannot supply that runtime. Do not push, merge, or deploy this review without explicit approval.

# AI Agent Workshop — v0.1.0-rainbow

**Preserved Rainbow release, before the next major iteration.** The application is unchanged from the working Rainbow prototype. Its original internal `Prototype 0.2` label is retained; the annotated Git release tag is `v0.1.0-rainbow`.

**GitHub Pages:** use **main → /docs** as the publishing source. The committed `docs/index.html` contains the complete application; no server, build service, or API key is required to host it. See [PUBLISHING.md](PUBLISHING.md) for the short upload/setup procedure and future-release workflow.

**Data limitation:** workspace contents stay in your browser and are not included in this repository. Export a backup before switching from a local file to the Pages address, then import it there. Read [PRIVACY.md](PRIVACY.md) before putting private text in a workspace or publishing a backup. Export/import functionality is preserved.

The release's original app files are hash-recorded in [the preservation manifest](releases/v0.1.0-rainbow/manifest.json). `npm run verify:rainbow` verifies the original tag even after later commits change the working version. Do not force-update release tags.

The original prototype, updated into a colorful shared studio. All agents have separate illustrated workstations; selecting one does not hide the others.

## Open it

Double-click `Open Workshop.cmd` on Windows, or open `dist/index.html` in Edge, Chrome, or Firefox. No installation, API key, or paid account is required. The interface also works offline with system fonts.

The separate **AI Agent Workshop.html** deliverable contains the same application in one file. Choose **Start guided tutorial** for the eight-lesson introduction, or replay it from Field guide. It advances through actual creation, execution, inspection, evaluation, and revision actions.

## Keep your existing agents

The upgrade retains the original `ai-agent-workshop.v1` storage key. Open the updated application at the same file path or web address, in the same browser profile, to keep existing agents, messages, runs, and evaluations. Existing Moss is assigned green; existing Herman is assigned orange, unless a color was already chosen in this version. IDs and instructions are preserved.

Moving the HTML file or changing browsers may show a fresh workspace. Use **Export workshop** in the old location, then **Import backup** in the updated location if needed. Import merges agents with new IDs and their histories; records with IDs already present are kept unchanged. It never replaces current agents. Backup import does not transfer the other workspace's tutorial state or unsaved drafts.

Old tutorial progress is retained as a legacy record. The new tutorial starts separately because its creation steps are different.

## Included

- Shared illustrated room with windows, plants, shelves, rainbow decorations, and matching individual desks. All agents remain visible; the room scrolls as it grows, with 100%, 85%, and 70% scale controls.
- Seven rainbow colors plus custom colors, three avatar shapes, four accessory choices, and seven symbols. Names, symbols, status text, and a selection marker supplement color.
- Explicit **Create New Agent** flow: identity, instructions/tools, review, then **Create Agent**. Creation adds a separate identity and returns to Workshop.
- Explicit **Edit [Name]** and **Save Changes**. Unsaved drafts are indicated and saved separately from live configurations.
- Task chat with sample-document summaries and action checklists.
- Independent agent runtimes: agents can run concurrently. Switching agents does not cancel a task. Pause, resume, cancellation, practice failures, and retry affect only the selected agent.
- Blueprint configuration: name, instructions, concise/detailed output, tool permission, editable sample document.
- Laboratory: run history, event details, immutable configuration snapshots, human scoring, and side-by-side output comparison.
- Separate conversations, instructions, documents, histories, and evaluations per agent.
- Eight tutorial lessons with eleven concrete action stages, exact-control highlighting, guided navigation, saved progress, replay, pause, resume, skip, and disable controls.
- Browser-local persistence, saved drafts, and JSON backup export/import.
- Responsive layouts, keyboard controls, modal focus containment, and reduced-motion support.

## Simulation boundary

This prototype does not call a language model. Responses are deterministic extracts from each agent's own sample document. Supported instruction cues include bullets, risk/uncertainty, next steps, and detailed summaries. Other instructions are recorded but are not interpreted freely. General chat, autonomous tool selection, real providers, external tools, semantic memory, scheduling, consequential-action approval workflows, evaluation datasets, real cost monitoring, collaboration/handoffs, and editable workflow graphs remain future work.

Avatars animate only for their own simulator activity. No communication, hidden model reasoning, or model-token estimates are fabricated. Saved chat history is not model memory. Each run costs $0 in API usage. Unsupported provider settings are labeled; no API keys are collected.

## Data

The most recent 80 runs per agent, conversations, configurations, evaluations, tutorial progress, and unsaved drafts are saved in browser local storage, subject to its capacity. A storage failure appears in the footer; export a backup if storage becomes unavailable. Reloading cancels unfinished runs, records interruption events, and preserves their traces. Tasks do not continue while the page is closed.

## Architecture

The existing application is updated in place. `dist/engine.js` retains the provider adapter and event-driven runtime. `dist/app.js` maintains a runtime per agent ID, routes events to the corresponding history, migrates saved state, and manages the existing views and tutorial. Every run snapshots its configuration before execution. `dist/identity.js` provides persistent identities, appearance controls, and the shared room. `dist/rainbow.css` extends the original responsive styles. No build step is required.

A future real provider should run on a backend with server-side secrets, permission enforcement, model/tool loops, execution limits, and durable storage. The current provider and event boundaries are extension points; they do not imply these integrations already exist.

## Development

With Node.js installed, run `node server.cjs` and open the printed local address. The server binds only to your computer. For dependency-free runtime checks, run `node tests/runtime.test.cjs`. For interface checks, install development dependencies with `npm install`, then run `npm test` (Node.js 24 recommended). See `VALIDATION.md` for tested workflows and verification limits.

Local hosting registration and account files are excluded from Git and publication. This repository is ready for GitHub Pages, but preparation alone does not publish it. See [the privacy audit](PUBLICATION_AUDIT.md), [release notes](releases/v0.1.0-rainbow/RELEASE_NOTES.md), and [changelog](CHANGELOG.md).

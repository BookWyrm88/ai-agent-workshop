# Local workspace data and public source

## What the application stores

Agents, sample documents, conversations, execution traces, queues, configuration versions, handoff payloads, session summaries, intentional memories, tutorial progress, and unsaved drafts live in browser `localStorage`, using the existing key `ai-agent-workshop.v1`. There is no account synchronization, backend database, or cloud backup in this release. Local storage is not encrypted by this application.

This review retains task history without the old 80-run pruning rule. Browser storage limits still apply; export regularly. Clearing browser data can remove the workspace. Changing browser profiles, devices, or addresses can show an empty workspace. Reloading cancels active simulations, preserves their trace, and holds pending queues for explicit resume; tasks do not continue when the page is closed.

## Export and import

**Export workshop** saves a JSON file to your computer. It can contain private text entered into the application. Keep it outside the public repository and share it only deliberately. **Import backup** reads a selected JSON file locally and merges agents whose IDs are not already present, including their histories, evaluations, configuration versions, sessions, memories, handoffs, and queued assignments. Imported queues wait for explicit resume. It does not overwrite existing identities or restore tutorial progress/unsaved drafts from another workspace.

Publishing source code to GitHub does not read or upload browser storage. A newly opened site starts with its own storage. Export from the current local address and import at the Pages address to move saved agents.

Browser storage is scoped to an origin, not a repository path. Separate GitHub Pages project sites under the same account can share the same origin and storage key. This review retains that behavior. Do not use the same browser profile for untrusted scripts hosted on the same origin. A custom domain or separate browser profile separates that storage.

## Network behavior

Simulation tasks make no AI API calls and do not send task text to a model. This review uses local system fonts; the standalone review file makes no external requests. GitHub Pages also receives ordinary requests needed to serve the public site. This review has no analytics or application telemetry.

## Public repository boundary

The publication audit covers tracked application files, tests, packaging, documentation, and initial commit/tag metadata. Private local hosting registration, account configuration, screenshots, attachments, browser exports, dependency directories, and scratch files are excluded. `.gitignore` does not protect files that someone deliberately force-adds, so audit and review every future staged change.

No provider credentials should be entered into this static application. Future real integrations need a backend and secure server-side credential handling; GitHub Pages alone does not provide that backend.

Theme selection is stored separately under `ai-agent-workshop.theme.v1`. The application does not collect credentials. Deleting a memory removes it and selected context copies, but immutable past run snapshots and exported backups may still contain it. Archive is reversible; permanent agent deletion is not offered in this review.

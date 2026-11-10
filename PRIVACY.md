# Local workspace data and public source

## What the application stores

Agents, sample documents you edit, conversations, execution traces, evaluations, tutorial progress, and unsaved drafts live in browser `localStorage`, using the existing key `ai-agent-workshop.v1`. There is no account synchronization, backend database, or cloud backup in this release. Local storage is not encrypted by this application.

The application retains at most 80 runs per agent. Browser storage limits still apply. Clearing browser data can remove the workspace. Changing browser profiles, devices, or addresses can show an empty workspace. Reloading interrupts active simulations and preserves the recorded trace; tasks do not continue when the page is closed.

## Export and import

**Export workshop** saves a JSON file to your computer. It can contain private text entered into the application. Keep it outside the public repository and share it only deliberately. **Import backup** reads a selected JSON file locally and merges agents whose IDs are not already present, including their histories and evaluations. It does not overwrite existing identities or restore tutorial progress/unsaved drafts from another workspace.

Publishing source code to GitHub does not read or upload browser storage. A newly opened site starts with its own storage. Export from the current local address and import at the Pages address to move saved agents.

Browser storage is scoped to an origin, not a repository path. Separate GitHub Pages project sites under the same account can share the same origin and storage key. This preserved release has not changed that behavior. Do not use the same browser profile for untrusted scripts hosted on the same origin. A custom domain or separate browser profile separates that storage.

## Network behavior

Simulation tasks make no AI API calls and do not send task text to a model. The original stylesheet requests DM Sans and Manrope from Google Fonts; the font service receives ordinary web request information. These font requests do not include workspace contents. System-font fallbacks work offline. GitHub Pages also receives ordinary requests needed to serve the public site. This release has no analytics or application telemetry.

## Public repository boundary

The publication audit covers tracked application files, tests, packaging, documentation, and initial commit/tag metadata. Private local hosting registration, account configuration, screenshots, attachments, browser exports, dependency directories, and scratch files are excluded. `.gitignore` does not protect files that someone deliberately force-adds, so audit and review every future staged change.

No provider credentials should be entered into this static application. Future real integrations need a backend and secure server-side credential handling; GitHub Pages alone does not provide that backend.

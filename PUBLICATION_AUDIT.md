# Publication audit — v0.1.0-rainbow

Audit date: 2026-11-10. Scope: the intended first Git commit, its public application bundle, and the release/tag metadata. The audit is for this snapshot, not future changes.

## Findings and disposition

- **Local hosting registration:** found outside the publishable app assets. Kept locally, excluded from Git by `.openai/`. No hosting project identifier or credential is included in the tracked release.
- **Commit author privacy:** the machine's default Git identity used a personal address. This repository uses the authenticated account's public GitHub login and verified account-ID-based no-reply address instead. The global Git configuration was not changed.
- **Browser workspaces:** no workspace exports, personal documents, conversations, user screenshots, or account files are included. The app's sample report and test-agent fixtures are demonstration data. Actual user workspaces remain in browser storage, which was not extracted for this release.
- **Credentials:** no live credentials were identified in the staged application, tests, dependency lock, scripts, or documentation. Automated checks cover common provider/GitHub key forms, private-key headers, embedded credential URLs, literal credential assignments, personal-email patterns, home-directory paths, and local hosting identifiers. Findings are reported by filename/rule, never by printing the suspected credential.
- **External requests:** the original Google Fonts import is retained and documented in `PRIVACY.md`. No application analytics, model API requests, or workspace-upload behavior was found in this release.
- **Local-only exclusions:** credential/settings files, dependencies, backups, logs, attachments, screenshots, and scratch folders are ignored. Ignore rules were checked with representative paths, including the existing local hosting file and the app's default export filename.

## Verification

- Reviewed the intended tracked file list and the application/data flows; only release source, static assets, tests, packaging, and documentation are staged.
- The staged-file audit reports no configured secret/private-data pattern matches.
- The Pages entry point matches the original standalone Rainbow HTML byte-for-byte.
- SHA-256 preservation checks cover all six original application source files and the standalone Pages entry point.
- Functional tests include runtime behavior, independent agents, the tutorial, export/import, and initialization at a GitHub Pages project path.
- The initial commit and annotated tag use a GitHub no-reply identity, with no personal address in their metadata.

No public upload was performed as part of local preparation. The connected GitHub tools did not provide repository creation or Pages configuration; `PUBLISHING.md` supplies the remaining steps.

This is a targeted automated scan plus source review, not a guarantee that every possible sensitive value can be recognized. Review and rescan staged changes before future publication. Dependency security and full visual/browser rendering are separate from this privacy audit.

# Validation — version 0.2

Automated DOM/interface checks cover:

- Create orange Herman without modifying green Moss.
- Both workstations remain in the shared room when selecting either agent.
- Distinct colors and avatar shapes persist across reloads.
- Edit Herman's instructions and role; verify all Moss fields are unchanged.
- Run Herman while Moss remains idle, then run both concurrently.
- Pause Moss without pausing Herman; resume Moss independently.
- Incoming runtime events preserve an unsaved configuration draft.
- Inspect Herman's trace; verify running tasks retain their original configuration snapshot.
- Add a third agent without replacing either existing agent.
- Reload identities, histories, configuration changes, and tutorial drafts.
- Migrate original v1 records while retaining IDs, instructions, histories, and the legacy tutorial record.
- Complete all eight tutorial lessons through eleven actual interface actions, including creation, execution, inspection, scoring, instruction revision, and comparison.
- Pause/resume, disable, and replay the tutorial without deleting agents.
- Practice failure, retry, and cancel remain functional.
- Backup import merges independent agents without duplication, rejects invalid identity data before mutation, and preserves existing records.
- Twenty workstations are retained in the scrollable room structure; custom colors, accessories, and symbols persist.
- User-entered names are escaped, and nameplate text contrast passes 4.5:1 across 1,331 sampled custom colors.
- Runtime checks preserve numeric source data, apply supported instruction cues, enforce disabled-tool errors, and keep events attached to the correct run.

These checks run against the real application scripts in a DOM environment. They are not screenshots or full browser rendering tests. The embedded browser's local-file security restriction and an unreachable local preview server prevented visual verification at desktop/mobile sizes. Responsive styling and reduced-motion handling are implemented, but their rendered layout still requires a normal-browser visual check.

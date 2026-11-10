# Rainbow Workshop — v0.1.0-rainbow

Preserved on 2026-11-10 before the next major iteration.

This is the existing working Rainbow Workshop: a shared illustrated space with independently configured agents, customizable rainbow identities, simulation task execution, traces, evaluation, and a hands-on tutorial.

The six original application source files and the standalone Pages entry point are recorded by SHA-256 in `manifest.json`. The application implementation is unchanged. The legacy `Prototype 0.2` label remains visible; this preservation release is tagged `v0.1.0-rainbow`.

## Included preservation work

- Clean Git repository with an annotated release tag.
- A Pages-ready `/docs/index.html` and `.nojekyll`, reproducibly assembled from the original files.
- README, publication instructions, privacy notes, staged-file audit, and preservation verification script.
- Commit metadata using a GitHub no-reply address.

## Known limitations retained

- Simulation only; no real providers, collaboration, scheduling, or backend.
- Workspace data stays in browser local storage; export/import is needed when changing addresses or browsers.
- The tutorial advances after required actions; a manual next-step override is not implemented in this preserved version.
- Prior visual/browser verification was limited by local preview access. Automated DOM/runtime checks cover the principal interactions.
- Google Fonts is an external stylesheet dependency with system-font fallbacks.

Do not move or recreate this tag. Future iterations should add commits and new release tags. A new GitHub Release listing can reference this existing tag without changing its commit.

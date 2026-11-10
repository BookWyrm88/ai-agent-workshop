# Review the Neon iteration locally

1. In the current Rainbow app, choose **Export workshop** and keep that file private.
2. Double-click **AI Agent Workshop - Neon Review.html**, or open this repository's **docs/index.html**. The original Rainbow HTML remains separate.
3. Choose **Import backup** to bring over existing agents. Existing IDs in the review are kept unchanged. A new workspace starts with a new Moss, so importing an older Moss can show two names with different identities. Archive the unused starter if desired.
4. In Field guide, start the tutorial. Try Skip Step, I'm stuck, Exit/Resume, and Back. Practice agents are labeled in the roster. Reset Experiment removes those fixtures and their records only.
5. In Agent Roster, edit a role, inspect versions, restore a prior version, rest an agent, and return it to the room.
6. In Task queue, choose Hold queue. Assign several tasks in Workshop. Reorder/cancel them in the queue, then resume. Refresh during execution: active work stops and pending assignments wait for explicit resume.
7. In Workshop's Research → Evaluation panel, choose Create safe demo pair, then Run simulated collaboration. Inspect the handoff between workstations and its JSON. Laboratory shows the same recorded events.
8. In Sessions & memory, save a summary, start fresh, and attach the old summary to context. Save, edit, and delete one harmless memory.
9. In Settings, switch between Neon Noir, Spectrum Studio, and Forest Sanctuary. Agent records remain unchanged.

## Release safety

Review branch: `feature/neon-workshop`. Original tag: `v0.1.0-rainbow`, with original asset hashes verified. No merge, push, tag replacement, or deployment is included. The original Rainbow HTML, release ZIP, and Git bundle remain in place.

Export before switching branches or opening the old release: downgrade migration is not supported. The old app does not understand new queues/sessions. Use a separate review file and import a backup to keep the original workspace available.

## Browser review still needed

Automated tests exercise actual interface scripts and saved data. The available preview browser could not connect to the local server. Rendered desktop/mobile layout, packet alignment, keyboard traversal, and screen-reader behavior still need a normal-browser check. Reduced-motion settings should stop animations while leaving event/status controls usable.

After review, explicitly approve publishing if you want GitHub Pages updated. Future releases receive new tags; never move `v0.1.0-rainbow`.

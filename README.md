# Coding Club Build Lab

Run it → predict it → change it → add to it → explain it.

This repository is a browser-first, eight-meeting coding-club sequence for students who are new to programming. Every meeting begins with a working starter project, a five-minute re-entry path, and three levels of challenge:

- **Remix:** change a working feature.
- **Builder:** copy a demonstrated pattern and add something new.
- **Boss Level:** an optional open-ended extension.

## Open the club launcher

In GitHub Codespaces, the preview server starts on port 8000 during both Codespace creation and restart. If it does not open automatically, use the **Ports** panel and open port 8000 in the browser. The launcher and Mission Control use that same preview.

The launcher at [`index.html`](index.html) opens the rendered Day Zero setup guide and Mission Control for every meeting. Mission Control keeps directions in one tab and the live project preview beside them; the Codespace editor remains the place where students edit code. Meetings 4–5 open Sprig in a separate tab because the external editor cannot be embedded reliably.

The final presentation tools are the [`Meeting 8 Mission Control`](meetings/08-showcase/mission.html) page and [`showcase/showcase-card.html`](showcase/showcase-card.html).

Complete the [`Account Pit Stop`](ACCOUNT-PIT-STOP.html) with your teacher before creating a team repository. The printable fallback is [`ACCOUNT-PIT-STOP.md`](ACCOUNT-PIT-STOP.md).

## Team workflow

1. Open the team's private repository in Codespaces.
2. Choose one driver; everyone else navigates, tests, designs, or documents.
3. Save frequently.
4. At the end, use **Source Control → Commit → Sync Changes**.
5. Stop the Codespace when the meeting ends.

Only one person edits a team repository at a time. Students never share passwords or account credentials.

## Repository map

- `shared/` contains the beginner helper library, styles, AI protocol, debugging guide, roles, and recovery steps.
- `meetings/` contains the eight student-facing kits and rendered Mission Control pages.
- `showcase/` contains the final presentation materials.
- `teacher/` is intentionally absent from the public template. Keep solutions, reset copies, and facilitator notes in a separate private teacher repository.

## AI agreement

AI is optional. It may explain, brainstorm, debug, suggest tests, or review accessibility. It may not silently author the project. Every meaningful use belongs in the meeting's `AI-LOG.md`, and students must be able to explain retained code.

## Safety and privacy

Keep student repositories private during the pilot. Use team names instead of student full names in project files. Do not put passwords, API keys, personal data, school-system credentials, or private student information into code or AI prompts.

## Validate before launch

From the repository root:

```bash
node scripts/validate-build-lab.mjs
node scripts/test-preview-server.mjs
```

The first command checks JavaScript syntax, local HTML references, Mission Control configurations, required core files for all eight meetings, and the dimensions of the Sprig starter bitmaps. The second command exercises preview health, version polling, missing-file handling, and traversal rejection. These checks do not replace the managed-Chromebook/Sprig rehearsal in the teacher repository.

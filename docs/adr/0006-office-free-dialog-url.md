# 0006 — Office-free dialog-URL resolution

**Status:** Accepted (production bug: error dialog 404 in production)

## Context

ADR-0004 deepened `commands.ts` into a thin `OfficeCommandHost` and drew
the line that it keeps "only Office.js calls (dialog, requirements,
event)". But `showDialog()` also *built* the dialog URL:
`${location.origin}/dialog.html?...`. That is a decision, not an
Office.js call, and it was wrong: `location.origin` is scheme+host only,
so it dropped the GitHub Pages project base path (`/Power-Prez-Tools/`)
and the message dialog 404'd in production on every error path. No seam,
no scenario; `npm test` could not reach it and the dev sideload passed
because the dev server serves at the host root, where the bug is
invisible.

## Decision

Lift the resolution into a pure core decision,
`resolveDialogUrl(baseHref, message)` in `src/core/dialogUrl.ts`,
resolving `dialog.html` relative to the add-in's own page (`new
URL(rel, baseHref)`) so the project base path is preserved.
`OfficeCommandHost` only supplies `location.href`. Red-first scenarios in
`commands.feature` cover both the Pages project subpath and the dev
host-root case. This extends ADR-0004 rather than contradicting it: the
line is the same ("commands.ts speaks only Office.js"), now also true of
the URL.

## Consequences

- The dev-vs-prod base-path trap is pinned by a Node-tested decision
  instead of being verifiable only by hand in production.
- The broken artifact was the Pages-hosted `commands.js`, not the npm
  package; merging to `main` redeploys it via `pages.yml` with no npm
  republish or user reinstall.
- `src/commands/commands.ts` is again purely Office.js calls.

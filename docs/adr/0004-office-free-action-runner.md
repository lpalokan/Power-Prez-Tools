# 0004 — Office-free ActionRunner over a CommandHost seam

**Status:** Accepted (issue #8, part 4)

## Context

The pure cores were well covered, but the glue where real bugs live was
not. `commands.ts` owned the PowerPointApi-1.4 gate, the
`try/catch/finally` that guarantees `event.completed()`, error→dialog
mapping, and service wiring — zero tests, imported Office directly.
CLAUDE.md makes BDD mandatory, yet user-facing behaviours ("old
PowerPoint is rejected", "errors surface in a dialog",
"`event.completed` always fires") had no seam and no scenario.

## Decision

Extract a core `ActionRunner` over a `CommandHost` seam (`isSupported` /
`showMessage` / `completeEvent`) plus a `TOO_OLD_MESSAGE` constant.
`commands.ts` becomes a thin `OfficeCommandHost`; `FakeCommandHost` is
the second adapter. The messaging behaviours become `.feature`
scenarios in `commands.feature` (written red-first, then implemented).

## Consequences

- The interface is the test surface for behaviour previously verifiable
  only by hand in PowerPoint; the mandatory-BDD gap is closed.
- `commands.ts` keeps only Office.js calls (dialog, requirements, event).
- Largest of the four changes; sequenced last as planned.

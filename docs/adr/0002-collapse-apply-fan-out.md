# 0002 — Collapse `apply*` to `applyGeometry(Partial<Geometry>)`

**Status:** Accepted (issue #8, part 2)

## Context

"Paste a subset of geometry" was smeared across five files:
`geometry.ts` (`positionOf`/`dimensionsOf`), `CaptureService` (three
one-line paste methods), the port (`applyPosition`/`applyDimensions`/
`applyGeometry`), the adapter (three near-identical `withSelected`
bodies), and the fake (three near-identical setters). The port was four
methods wide where the implementation was "set whichever fields you were
given".

## Decision

Collapse the port to `getSelectedGeometry()` + `applyGeometry(partial:
Partial<Geometry>)` (4 → 2). "Which fields" stays pure data in core:
`CaptureService` calls `applyGeometry(positionOf(g))`,
`applyGeometry(dimensionsOf(g))`, or `applyGeometry(g)`. Adapters set
only the fields present on the partial.

## Consequences

- Same leverage behind a smaller interface; adapter and fake each lose
  two duplicated bodies (fewer places for the ADR-0001 drift).
- Done together with 0001 — shared files, reinforcing.
- Geometry stays in **points**; the partial-spread does not introduce
  any unit handling.

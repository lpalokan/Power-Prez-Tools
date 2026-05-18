# 0001 — The selection invariant has one home

**Status:** Accepted (issue #8, part 1)

## Context

"Exactly one shape selected — else `SelectionError`" is part of the
`ShapeGeometryPort` contract, but it was hand-copied in three places:
twice in `OfficeShapeGeometryAdapter` and once in
`FakeShapeGeometryPort.one()`. The exact error strings are load-bearing
(step definitions assert them by regex). Both files carried comments
admitting drift only surfaces during manual Mac testing — a known seam
leak the Cucumber suite could not catch.

## Decision

Introduce a pure core helper `requireExactlyOne<T>(selected): T` in
`shapeGeometryPort.ts` that owns the count→error decision and both
message strings. The real adapter and the fake both call it. The
PowerPoint-coupled part (load shapes, `ctx.sync`) stays in the adapter.

## Consequences

- The contract and its wording live in one module the Cucumber suite
  exercises, not three reconciled only by hand on a Mac.
- The fake can no longer be a place contract drift hides.
- A "paste with no shape selected" scenario was added to lock the
  invariant onto the paste path, not just capture.

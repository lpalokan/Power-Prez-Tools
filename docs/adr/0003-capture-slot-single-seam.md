# 0003 — The capture slot is a single seam

**Status:** Accepted (issue #8, part 3)

## Context

`CaptureStore` wrapped `CaptureSlotStorage` and added almost nothing:
`capture` = `write({...g})`, `get` = `read()`, `clear` = `write(null)`,
`isEmpty` = `read() === null`. Two interfaces and two seams for one
concept — the capture slot — with exactly one caller (`CaptureService`)
plus the test world. A pass-through layer a reader had to unstack.

## Decision

Fold the slot vocabulary into the seam itself: `CaptureSlot` with
`capture` / `peek` / `clear` / `isEmpty`, and two adapters —
`MemoryCaptureSlot` (core, default/tests) and `LocalStorageCaptureSlot`
(`src/office/`). Delete `CaptureStore` and `CaptureSlotStorage`.

## Consequences

- One module is "the capture slot" instead of a Store-over-Storage
  sandwich. The localStorage-survives-runtime-teardown reasoning attaches
  to the one concept it is about.
- The test World now keeps the `MemoryCaptureSlot` instance across a
  simulated runtime restart (it is the durable thing), modelling
  localStorage directly.
- Behaviour-preserving; the "value survives the command runtime
  restarting" scenario is the regression net.

# CONTEXT

Domain language for Power Prez Tools. One vocabulary, used in code,
tests, and Gherkin alike. When a term here appears in a `.feature` file,
a class name, and a comment, it means the same thing.

## Core concepts

- **Geometry** — a shape's `left`, `top`, `width`, `height`, always in
  **points** (the PowerPoint Office.js Shape API unit; never EMU). A
  *position* is `{left, top}`; *dimensions* are `{width, height}`. "Which
  fields to paste" is pure data (`positionOf` / `dimensionsOf` / the
  whole), not a fan-out of methods — see ADR-0002.

- **Capture slot** — the single place one shape's geometry is held
  between a Copy and a Paste. It *is* the seam (`CaptureSlot`:
  `capture` / `peek` / `clear` / `isEmpty`), not a Store wrapped around a
  Storage. Persistence is the adapter's concern: `MemoryCaptureSlot`
  (default, tests) vs `LocalStorageCaptureSlot`, which survives the
  PowerPoint-for-Mac ribbon runtime being torn down between button
  clicks. See ADR-0003.

- **Selection invariant** — "exactly one shape must be selected". Zero →
  `SelectionError("No shape selected.")`; many →
  `SelectionError("Select exactly one shape.")`. It has one home,
  `requireExactlyOne`, called by both the real adapter and the fake. The
  error strings are load-bearing — step definitions assert them by
  regex. See ADR-0001.

## Seams (ports & adapters)

Pure logic in `src/core/` imports zero Office.js and depends only on
these interfaces; each has a real adapter and a Cucumber fake:

| Seam | Concept | Real adapter | Fake |
| --- | --- | --- | --- |
| `ShapeGeometryPort` | read/write the selected shape's geometry | `OfficeShapeGeometryAdapter` | `FakeShapeGeometryPort` |
| `CaptureSlot` | the capture slot | `LocalStorageCaptureSlot` | `MemoryCaptureSlot` |
| `CommandHost` | the ribbon host (API gate, message, event done) | `OfficeCommandHost` | `FakeCommandHost` |
| `FileSystemPort` | installer filesystem | `NodeFileSystem` | `FakeFileSystem` |
| `CliEnvironment` | the CLI's outside world (stdout/exit/staging/reveal) | `NodeCliEnvironment` | `FakeCliEnvironment` |

- **CaptureService** — all capture/paste decision logic, behind
  `ShapeGeometryPort` + `CaptureSlot`. Zero Office.js.

- **ActionRunner / CommandHost** — the orchestration glue lifted out of
  `commands.ts`: the PowerPointApi-1.4 gate, error→message mapping, and
  the guarantee that `completeEvent()` fires on every path (success,
  error, unsupported host) so the ribbon button never hangs.
  `commands.ts` is now a thin `OfficeCommandHost`. See ADR-0004.

- **Cli / CliEnvironment** — the same treatment for the installer CLI:
  command dispatch, error→message/exit-status mapping, and the
  blocked-install recovery (stage somewhere writable, reveal it, explain)
  lifted out of `cli/main.ts` into a testable `Cli`. `main.ts` is now a
  thin wire-up of `NodeCliEnvironment` + `NodeFileSystem`. See ADR-0005.

## Where things can only be verified by hand

`src/office/*` and `src/commands/commands.ts` are the PowerPoint-coupled
adapters; they are not in the Node test build. Everything they decide has
been pushed into core seams the Cucumber suite exercises. See
`docs/testing.md` for the remaining manual-on-Mac checklist.

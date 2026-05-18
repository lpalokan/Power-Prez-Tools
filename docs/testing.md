# Testing

This project follows the BDD-first workflow mandated by `CLAUDE.md`.
Gherkin `.feature` files are the source of truth. Because a PowerPoint
add-in is TypeScript/Office.js (not Dart), the scenarios are wired to a
native TypeScript runner — **Cucumber.js** — instead of Dart
`build_runner`. The directory layout from `CLAUDE.md` is preserved.

## Layout

```
integration_test/
  features/
    capture_paste.feature          capture/paste scenarios (source of truth)
    commands.feature               ribbon-host scenarios (source of truth)
    cli.feature                    installer-CLI scenarios (source of truth)
    installer.feature              installer pure-logic scenarios
    step/capture_paste.steps.ts    capture/paste step definitions
    step/commands.steps.ts         ribbon-host step definitions
    step/cli.steps.ts              installer-CLI step definitions
    step/installer.steps.ts        installer pure-logic step definitions
  support/
    world.ts                       Cucumber World (wires service + fakes)
    harness.ts                     FakeShapeGeometryPort (in-memory)
    fakeCommandHost.ts             FakeCommandHost (records host calls)
    fakeCliEnvironment.ts          FakeCliEnvironment (records CLI effects)
    fakeFileSystem.ts              FakeFileSystem (installer fs)
```

Domain vocabulary used across code, tests, and Gherkin is defined in
`CONTEXT.md`; the decisions behind these seams are in `docs/adr/`.

## The seams

All decision logic lives in `src/core/` and imports zero Office.js, so
every behaviour — including edge cases — is provable in plain Node. Each
seam has a real adapter and a Cucumber fake (see `CONTEXT.md`):

- `ShapeGeometryPort` (`src/core/shapeGeometryPort.ts`) —
  `FakeShapeGeometryPort` (`support/harness.ts`) vs
  `OfficeShapeGeometryAdapter` (`src/office/`).
- `CaptureSlot` (`src/core/captureSlot.ts`) — `MemoryCaptureSlot` vs
  `LocalStorageCaptureSlot` (`src/office/`).
- `CommandHost` (`src/core/commandHost.ts`) — `FakeCommandHost`
  (`support/fakeCommandHost.ts`) vs `OfficeCommandHost`
  (`src/commands/commands.ts`). The API gate, error→message mapping and
  always-fire `completeEvent` are in the Office-free `ActionRunner`.
- `CliEnvironment` (`src/cli/cli.ts`) — `FakeCliEnvironment`
  (`support/fakeCliEnvironment.ts`) vs `NodeCliEnvironment`
  (`src/cli/`). Command dispatch, error→message/exit mapping and the
  blocked-install stage→reveal→explain recovery are in the pure `Cli`;
  `main.ts` is a thin wire-up. `FileSystemPort` (`src/cli/installer.ts`)
  is the installer's own seam (`NodeFileSystem` vs `FakeFileSystem`).

**Contract wording:** `SelectionError` ("No shape selected." / "Select
exactly one shape.") now has one home, `requireExactlyOne`, called by
both the geometry adapter and its fake — the messages can no longer drift
between them. `NothingCapturedError` ("Nothing has been captured yet.")
and `TOO_OLD_MESSAGE` are likewise single constants. Step assertions
match these by regex; only the PowerPoint-specific load/sync in the
adapters remains Mac-only.

## BDD loop

1. Add/extend a scenario in `integration_test/features/*.feature` first.
2. Reuse an existing step phrase if one fits; only add a new step in
   `step/capture_paste.steps.ts` (delegating through the World/service)
   when none does.
3. `npm test` — confirm the new scenario fails for the right reason (red).
4. Implement in `src/core/` until it passes (green); refactor under green.
5. Mirror any new `ShapeGeometryPort` behaviour into both the fake and
   the Office adapter.

Bug fixes follow the same loop: add a reproducing scenario first.

## Commands (verifiable in any environment, incl. CI/Linux)

```
npm install
npm test
npm run lint
npm run build
npm run validate
```

`npm test` runs the full Gherkin suite against the fake port and proves
all capture/paste logic and edge cases with no PowerPoint.

## Step catalogue

| Phrase | Kind |
| --- | --- |
| `an empty capture slot` | Given |
| `a shape "<id>" at left <n> top <n> width <n> height <n> is selected` | Given |
| `no shape is selected` | Given |
| `shapes "<a>" and "<b>" are both selected` | Given |
| `I capture position and dimensions` | When/And |
| `I paste position` | When |
| `I paste dimensions` | When |
| `I paste both` | When |
| `the capture slot holds left <n> top <n> width <n> height <n>` | Then |
| `shape "<id>" is at left <n> top <n> width <n> height <n>` | Then |
| `the capture slot is empty` | Then |
| `I am told nothing has been captured yet` | Then |
| `I am told no shape is selected` | Then |
| `I am told to select exactly one shape` | Then |
| `this PowerPoint is too old for the add-in` | Given |
| `I run the copy command` | When |
| `I run the paste-both command` | When |
| `I am shown a message to update PowerPoint` | Then |
| `I am shown a message that nothing has been captured yet` | Then |
| `I am shown a message that no shape is selected` | Then |
| `no message is shown` | Then |
| `the command signals it is done` | Then |
| `the add-in is served from "<href>"` | Given |
| `a "<message>" message needs a dialog` | When |
| `the dialog opens at "<url>"` | Then |
| `I run the CLI with "<command>"` | When |
| `the CLI says the manifest was installed` | Then |
| `the CLI says nothing was installed` | Then |
| `the CLI prints usage help` | Then |
| `the CLI says the platform is unsupported` | Then |
| `the CLI exits successfully` | Then |
| `the CLI exits with a failure` | Then |
| `the CLI staged the manifest where the user can reach it` | Then |
| `the CLI revealed the staged manifest` | Then |
| `the CLI explains the macOS permission restriction` | Then |

## What only a Mac (with PowerPoint) can verify

The following cannot be exercised in the Linux/CI container — they need a
real PowerPoint host:

- `src/office/officeShapeGeometryAdapter.ts` (the `PowerPoint.run` /
  `getSelectedShapes()` calls and real points-based geometry). The
  selection-invariant decision is in core (`requireExactlyOne`) and is
  Node-tested; only the load/sync is Mac-only.
- `src/office/localStorageCaptureSlot.ts` (the `localStorage` persistence
  that survives the Mac ribbon runtime being torn down between clicks).
  The persistence behaviour itself is covered in Node by the "command
  runtime restarting" scenario via `MemoryCaptureSlot`.
- The ribbon function-file runtime `src/commands/commands.ts`: the
  `Office.actions.associate` wiring and the Office.js plumbing of
  `OfficeCommandHost` (the `isSetSupported("PowerPointApi", "1.4")` call,
  the `displayDialogAsync` dialog, `event.completed()`). The *decisions*
  around them — the API gate, error→message mapping, always-fire
  completion, and the dialog URL (`resolveDialogUrl`, after it 404'd in
  production) — are in core and covered by `commands.feature`; only the
  `displayDialogAsync` call itself is Mac-only.
- Live manifest load (`VersionOverrides` ribbon controls) and the
  `ReadWriteDocument` permission grant.

### UI surface

The add-in has **no task pane**. It adds a "Power Prez Tools" group to
the PowerPoint Home tab with: a **Copy dimensions and position** button, a
**Paste dimensions and position** button, and a **Paste options** dropdown
(**Paste dimensions only** / **Paste position only**). Each maps to a
`CaptureService` method. Success is silent (the image visibly moves);
errors appear in a small Office dialog.

### Sideload and manual end-to-end test on the Mac

Requires PowerPoint for Mac new enough to support **PowerPointApi 1.4**
(older builds show the "too old" dialog on first command).

```
git pull
npm install
npx office-addin-dev-certs install
npm start
```

`npm start` (office-addin-debugging) builds, starts the HTTPS dev server
on port 3000 via the `dev-server` script, registers `manifest.xml` in the
Mac sideload folder, and launches PowerPoint. Then in PowerPoint, on the
**Home** tab look for the **Power Prez Tools** group:

1. Insert two images on a slide.
2. Select the first image → **Copy dimensions and position**.
3. Select the second image → **Paste dimensions and position** → it
   should snap to match.
4. Repeat using the **Paste options** dropdown → **Paste dimensions
   only** / **Paste position only** to confirm each applies only its half.
5. Edge checks: paste before copying; copy/paste with nothing selected;
   copy/paste with two shapes selected — each should show a clear error
   dialog and leave shapes unchanged.

Note: the captured value is persisted in the add-in origin's
`localStorage`, so Copy then Paste works even though the Mac ribbon
runtime is torn down between clicks; it also survives a PowerPoint
restart. Any defect found here must start a new BDD loop — add a
reproducing scenario before fixing.

## Distribution

End users install via `npx power-prez-tools install` (see the README).
The add-in's static files are hosted on GitHub Pages (deployed by
`.github/workflows/pages.yml`); the npm CLI only registers the
production manifest with PowerPoint. On **macOS** it copies the manifest
into the sandbox `wef` folder (with a guided Finder fallback when macOS
blocks that). On **Windows** it stores the manifest under
`%LOCALAPPDATA%` and points the per-user `HKCU\…\WEF\Developer` registry
value at it.

The installer's pure logic (`src/cli/installer.ts` — path resolution,
copy/remove, registry decisions — behind `FileSystemPort` and
`RegistryPort`) is covered by `installer.feature`, and the CLI
orchestration around it (`src/cli/cli.ts` — command dispatch, error→
message/exit mapping, the blocked-install stage→reveal→explain recovery)
by `cli.feature`, both using in-memory fakes. The Node adapters
(`nodeFileSystem.ts`, `nodeCliEnvironment.ts`) and the `reg.exe` adapter
(`windowsRegistry.ts`) are the only untestable boundary, mirroring the
Office.js seam; `main.ts` is a thin wire-up.

Windows users can alternatively run a native installer
(`installer/windows/power-prez-tools.nsi`, built by
`tools/build-windows-installer.sh`). It performs the same file +
registry steps the CLI does (and which the BDD suite covers), so it
needs no separate scenarios; only a manual smoke test on Windows. CI
builds it on every Pages deploy (served at
`/PowerPrezTools-Setup.exe`) and attaches it to GitHub Releases
(`.github/workflows/release.yml`).

## Releasing (maintainers)

One-time: in GitHub **Settings → Pages → Source: GitHub Actions**.
Pushing to `main` then deploys the add-in to
<https://lpalokan.github.io/Power-Prez-Tools> via
`.github/workflows/pages.yml` (manifest URLs are rewritten to the Pages
URL at build time). If the repo is renamed/moved, update
`DEFAULT_BASE_URL` in `tools/make-prod-manifest.mjs` — it is baked into
the manifest bundled in the npm package.

Publish the installer CLI with `npm publish` (`prepublishOnly` lints,
runs the BDD suite, builds the CLI to `lib/`, and regenerates
`manifest.prod.xml`). Users then get the new version via `npx`.

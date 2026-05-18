# 0005 — Office-free Cli runner over a CliEnvironment seam

**Status:** Accepted (issue #8, part 4 — `src/cli/main.ts`)

## Context

Part 4 names both `src/commands/commands.ts` and `src/cli/main.ts`.
ADR-0004 handled the former. `main.ts`'s `run()` still owned command
dispatch, error classification (`UnsupportedPlatformError` /
`PermissionDeniedError` / generic), the manifest-staging fallback, the
Finder reveal, and the process exit status — with only the pure
`Installer` helpers tested. The bugs hid in how those were wired, with no
seam and no scenario, against a mandatory-BDD rule.

## Decision

Extract a pure `Cli` runner over a `CliEnvironment` seam (`platform` /
`home` / `tmpDir` / `bundledManifest` / `downloadsExists` / `copyFile` /
`reveal` / `out` / `err` / `fail`). `NodeCliEnvironment` is the real
adapter (the only untestable boundary, mirroring `NodeFileSystem`);
`FakeCliEnvironment` is the second. `main.ts` is now a three-line
wire-up; its exported `run(argv)` (called by `bin/power-prez-tools.js`) is
unchanged. New red-first scenarios in `cli.feature`.

## Consequences

- The CLI orchestration — install/uninstall/help/unknown messaging, exit
  status, the blocked-install stage→reveal→explain recovery — is now
  proven in Node, not only by hand.
- Completes #8 part 4: both files named in the issue are now thin
  adapters over Node-tested seams.
- `FakeCliEnvironment` reads platform/home/tmp/Downloads from the World,
  so the existing installer `Given` steps drive these scenarios too.

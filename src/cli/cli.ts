import * as path from "path";
import {
  Installer,
  FileSystemPort,
  RegistryPort,
  UnsupportedPlatformError,
  PermissionDeniedError,
  fallbackStagePath,
  manualInstallSteps,
} from "./installer";

export const HELP = `Power Prez Tools - PowerPoint add-in installer

Usage:
  npx power-prez-tools install      Register the add-in with PowerPoint
  npx power-prez-tools uninstall    Remove the add-in from PowerPoint
  npx power-prez-tools help         Show this help

After installing, fully quit and reopen PowerPoint. The buttons appear on
the Home tab in the "Power Prez Tools" group.`;

/**
 * Everything the CLI runner needs from the outside world, with zero Node
 * built-ins. NodeCliEnvironment is the real adapter (the only untestable
 * boundary, mirroring NodeFileSystem); FakeCliEnvironment is the Cucumber
 * one, so the run() orchestration — command dispatch, error
 * classification, exit status, staging and Finder reveal — is provable in
 * Node instead of only by hand.
 */
export interface CliEnvironment {
  readonly platform: string;
  readonly home: string;
  readonly tmpDir: string;
  /** Path to the manifest bundled in the published package. */
  bundledManifest(): string;
  /** Whether ~/Downloads exists (decides the fallback staging location). */
  downloadsExists(): boolean;
  /** Copy a file. Throws if the destination is not writable. */
  copyFile(source: string, destination: string): void;
  /** Show the staged manifest and target folder to the user (Finder on macOS). */
  reveal(stagedManifest: string, containerDir: string): void;
  out(message: string): void;
  err(message: string): void;
  /** Mark the process as failed (non-zero exit). */
  fail(): void;
}

/**
 * The CLI orchestration, lifted out of main.ts so it is testable: command
 * dispatch, the error -> message/exit-status mapping, and the
 * blocked-install recovery (stage somewhere writable, reveal it, explain).
 * main.ts is now a thin wire-up of the Node adapters.
 */
export class Cli {
  constructor(
    private readonly env: CliEnvironment,
    private readonly fs: FileSystemPort,
    private readonly registry: RegistryPort,
  ) {}

  run(argv: string[]): void {
    const command = (argv[0] ?? "help").toLowerCase();
    const installer = new Installer(
      this.fs,
      this.registry,
      this.env.platform,
      this.env.home,
    );

    try {
      switch (command) {
        case "install": {
          const target = installer.install(this.env.bundledManifest());
          this.env.out(`Installed the Power Prez Tools manifest to:\n  ${target}\n`);
          this.env.out("Now fully quit PowerPoint (Cmd+Q) and reopen it.");
          this.env.out(
            'The buttons appear on the Home tab, in the "Power Prez Tools" group.',
          );
          break;
        }
        case "uninstall": {
          const removed = installer.uninstall();
          this.env.out(
            removed
              ? "Removed the Power Prez Tools add-in. Restart PowerPoint to finish."
              : "Power Prez Tools was not installed; nothing to do.",
          );
          break;
        }
        case "help":
        case "--help":
        case "-h":
          this.env.out(HELP);
          break;
        default:
          this.env.err(`Unknown command "${command}".\n`);
          this.env.out(HELP);
          this.env.fail();
      }
    } catch (e) {
      if (e instanceof UnsupportedPlatformError) {
        this.env.err(e.message);
      } else if (e instanceof PermissionDeniedError) {
        const staged = this.stageForManualInstall(e.manifestSource);
        this.env.reveal(staged, path.dirname(e.wefDir));
        this.env.err(e.message);
        this.env.err("\n" + manualInstallSteps(e.wefDir, staged));
      } else {
        this.env.err(`Failed to ${command}: ${(e as Error).message}`);
      }
      this.env.fail();
    }
  }

  /** Copy the bundled manifest somewhere the user can reach without FDA. */
  private stageForManualInstall(manifestSource: string): string {
    const staged = fallbackStagePath(
      this.env.home,
      this.env.tmpDir,
      this.env.downloadsExists(),
    );
    try {
      this.env.copyFile(manifestSource, staged);
    } catch {
      return manifestSource;
    }
    return staged;
  }
}

import { CliEnvironment } from "../../src/cli/cli";

/** Path the fake treats as the manifest bundled in the published package. */
export const FAKE_BUNDLED_MANIFEST = "/pkg/manifest.prod.xml";

/**
 * In-Node stand-in for the CLI's outside world. Records what Cli.run did
 * so step assertions can check the orchestration (messages, exit status,
 * staging, Finder reveal) that was previously only verifiable by hand.
 * Platform/home/tmp/Downloads are read from the World so the existing
 * installer Given steps drive these scenarios too.
 */
export class FakeCliEnvironment implements CliEnvironment {
  readonly stdout: string[] = [];
  readonly stderr: string[] = [];
  failed = false;
  readonly copied: Array<{ source: string; destination: string }> = [];
  revealed: { staged: string; containerDir: string } | null = null;
  /** When true, copyFile throws (the staging destination is not writable). */
  blockCopy = false;

  constructor(
    private readonly state: {
      platform: string;
      home: string;
      tmpDir: string;
      downloadsExists: boolean;
    },
  ) {}

  get platform(): string {
    return this.state.platform;
  }

  get home(): string {
    return this.state.home;
  }

  get tmpDir(): string {
    return this.state.tmpDir;
  }

  bundledManifest(): string {
    return FAKE_BUNDLED_MANIFEST;
  }

  downloadsExists(): boolean {
    return this.state.downloadsExists;
  }

  copyFile(source: string, destination: string): void {
    if (this.blockCopy) throw new Error("EACCES: not writable");
    this.copied.push({ source, destination });
  }

  reveal(stagedManifest: string, containerDir: string): void {
    this.revealed = { staged: stagedManifest, containerDir };
  }

  out(message: string): void {
    this.stdout.push(message);
  }

  err(message: string): void {
    this.stderr.push(message);
  }

  fail(): void {
    this.failed = true;
  }
}

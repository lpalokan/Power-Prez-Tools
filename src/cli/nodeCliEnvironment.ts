import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { spawnSync } from "child_process";
import { CliEnvironment } from "./cli";

/**
 * Real CLI environment: console, process exit status, os/fs, and Finder.
 * The untestable boundary, mirroring NodeFileSystem for the installer.
 */
export class NodeCliEnvironment implements CliEnvironment {
  readonly platform = process.platform;
  readonly home = os.homedir();
  readonly tmpDir = os.tmpdir();

  bundledManifest(): string {
    // Compiled to lib/cli/nodeCliEnvironment.js, so the package root is
    // two levels up.
    return path.join(__dirname, "..", "..", "manifest.prod.xml");
  }

  downloadsExists(): boolean {
    return fs.existsSync(path.join(this.home, "Downloads"));
  }

  copyFile(source: string, destination: string): void {
    fs.copyFileSync(source, destination);
  }

  /** Best-effort: show the staged manifest and the target folder in Finder. */
  reveal(stagedManifest: string, containerDir: string): void {
    if (process.platform !== "darwin") return;
    try {
      spawnSync("open", ["-R", stagedManifest], { stdio: "ignore" });
    } catch {
      /* ignore */
    }
    try {
      if (fs.existsSync(containerDir)) {
        spawnSync("open", [containerDir], { stdio: "ignore" });
      }
    } catch {
      /* ignore */
    }
  }

  out(message: string): void {
    console.log(message);
  }

  err(message: string): void {
    console.error(message);
  }

  fail(): void {
    process.exitCode = 1;
  }
}

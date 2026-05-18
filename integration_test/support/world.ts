import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { FakeShapeGeometryPort } from "./harness";
import { FakeFileSystem } from "./fakeFileSystem";
import { FakeRegistry } from "./fakeRegistry";
import { MemoryCaptureSlot } from "../../src/core/captureSlot";
import { CaptureService } from "../../src/core/captureService";
import { ActionRunner } from "../../src/core/commandHost";
import { FakeCommandHost } from "./fakeCommandHost";
import { FakeCliEnvironment } from "./fakeCliEnvironment";

export class TestWorld extends World {
  readonly port = new FakeShapeGeometryPort();
  // The slot instance outlives a runtime restart, modelling localStorage
  // in the PowerPoint ribbon runtime (which is torn down between clicks).
  readonly slot = new MemoryCaptureSlot();
  service = new CaptureService(this.port, this.slot);
  // The ribbon host seam (#4): the fake stands in for PowerPoint's
  // dialog/event/API-gate; ActionRunner is the Office-free glue.
  readonly host = new FakeCommandHost();
  runner = new ActionRunner(this.host, this.service);
  lastError: Error | null = null;

  // Dialog-URL resolution scenario state: the page the add-in is served
  // from, and the URL the message dialog would open.
  addinBaseHref: string | null = null;
  resolvedDialogUrl: string | null = null;

  // Installer scenario state.
  readonly fakeFs = new FakeFileSystem();
  readonly fakeRegistry = new FakeRegistry();
  platform = "darwin";
  home = "/Users/jo";
  resolvedDir: string | null = null;
  uninstalled: boolean | null = null;
  tmpDir = "/tmp";
  downloadsExists = false;
  // The CLI runner seam (#4): the fake reads platform/home/tmp/Downloads
  // from this World, so existing installer Given steps drive it too.
  readonly cliEnv = new FakeCliEnvironment(this);

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Simulate the ribbon function-file runtime being torn down and reloaded. */
  restartRuntime(): void {
    this.service = new CaptureService(this.port, this.slot);
    this.runner = new ActionRunner(this.host, this.service);
  }
}

setWorldConstructor(TestWorld);

import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { FakeShapeGeometryPort } from "./harness";
import { MemoryCaptureSlotStorage } from "../../src/core/captureSlotStorage";
import { CaptureStore } from "../../src/core/captureStore";
import { CaptureService } from "../../src/core/captureService";

export class TestWorld extends World {
  readonly port = new FakeShapeGeometryPort();
  // The backend outlives a runtime restart, modelling localStorage in the
  // PowerPoint ribbon runtime.
  private readonly storage = new MemoryCaptureSlotStorage();
  store = new CaptureStore(this.storage);
  service = new CaptureService(this.port, this.store);
  lastError: Error | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /** Simulate the ribbon function-file runtime being torn down and reloaded. */
  restartRuntime(): void {
    this.store = new CaptureStore(this.storage);
    this.service = new CaptureService(this.port, this.store);
  }
}

setWorldConstructor(TestWorld);

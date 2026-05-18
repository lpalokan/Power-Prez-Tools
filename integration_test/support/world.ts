import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { FakeShapeGeometryPort } from "./harness";
import { CaptureStore } from "../../src/core/captureStore";
import { CaptureService } from "../../src/core/captureService";

export class TestWorld extends World {
  readonly port = new FakeShapeGeometryPort();
  readonly store = new CaptureStore();
  readonly service = new CaptureService(this.port, this.store);
  lastError: Error | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(TestWorld);

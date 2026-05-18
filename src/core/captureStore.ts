import { Geometry } from "./geometry";
import { CaptureSlotStorage, MemoryCaptureSlotStorage } from "./captureSlotStorage";

/**
 * A single capture slot. Persistence depends on the injected backend:
 * memory by default (tests), localStorage in the PowerPoint ribbon runtime
 * (which is torn down between button clicks on Mac).
 */
export class CaptureStore {
  constructor(
    private readonly storage: CaptureSlotStorage = new MemoryCaptureSlotStorage(),
  ) {}

  capture(g: Geometry): void {
    this.storage.write({ ...g });
  }

  get(): Geometry | null {
    return this.storage.read();
  }

  get isEmpty(): boolean {
    return this.storage.read() === null;
  }

  clear(): void {
    this.storage.write(null);
  }
}

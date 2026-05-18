import { Geometry } from "./geometry";

/**
 * The capture slot: the single place one shape's geometry is held between
 * a Copy and a Paste. This is the seam itself — there is no Store wrapping
 * a Storage. Persistence is the adapter's concern: MemoryCaptureSlot (the
 * default, used by tests) versus LocalStorageCaptureSlot in the PowerPoint
 * ribbon runtime, which is torn down between button clicks on Mac.
 */
export interface CaptureSlot {
  /** Replace the slot's contents with a copy of this geometry. */
  capture(g: Geometry): void;
  /** The captured geometry, or null if the slot is empty. */
  peek(): Geometry | null;
  /** Empty the slot. */
  clear(): void;
  /** Whether the slot currently holds nothing. */
  readonly isEmpty: boolean;
}

/** Default capture slot: process memory. Lost when the runtime is torn down. */
export class MemoryCaptureSlot implements CaptureSlot {
  private slot: Geometry | null = null;

  capture(g: Geometry): void {
    this.slot = { ...g };
  }

  peek(): Geometry | null {
    return this.slot;
  }

  clear(): void {
    this.slot = null;
  }

  get isEmpty(): boolean {
    return this.slot === null;
  }
}

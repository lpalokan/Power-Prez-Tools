import { Geometry } from "./geometry";

/** Backing store for the single capture slot. */
export interface CaptureSlotStorage {
  read(): Geometry | null;
  write(slot: Geometry | null): void;
}

/** Default backend: process memory. Lost when the runtime is torn down. */
export class MemoryCaptureSlotStorage implements CaptureSlotStorage {
  private slot: Geometry | null = null;

  read(): Geometry | null {
    return this.slot;
  }

  write(slot: Geometry | null): void {
    this.slot = slot ? { ...slot } : null;
  }
}

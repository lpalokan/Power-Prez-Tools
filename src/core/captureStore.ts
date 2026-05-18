import { Geometry } from "./geometry";

/** A single in-memory capture slot. Cleared when the task pane reloads. */
export class CaptureStore {
  private slot: Geometry | null = null;

  capture(g: Geometry): void {
    this.slot = { ...g };
  }

  get(): Geometry | null {
    return this.slot;
  }

  get isEmpty(): boolean {
    return this.slot === null;
  }

  clear(): void {
    this.slot = null;
  }
}

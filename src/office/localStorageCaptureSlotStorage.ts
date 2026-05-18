import { Geometry } from "../core/geometry";
import { CaptureSlotStorage } from "../core/captureSlotStorage";

/* global localStorage */

const KEY = "powerPrezTools.captureSlot";

/**
 * Persists the capture slot in the function-file origin's localStorage.
 * On PowerPoint for Mac the ribbon runtime is torn down between button
 * clicks, so an in-memory slot is lost. localStorage survives because it
 * is keyed to the add-in origin and shared across runtime instances.
 */
export class LocalStorageCaptureSlotStorage implements CaptureSlotStorage {
  read(): Geometry | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Geometry;
    } catch {
      return null;
    }
  }

  write(slot: Geometry | null): void {
    if (slot === null) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, JSON.stringify(slot));
    }
  }
}

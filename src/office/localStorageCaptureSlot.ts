import { Geometry } from "../core/geometry";
import { CaptureSlot } from "../core/captureSlot";

/* global localStorage */

const KEY = "powerPrezTools.captureSlot";

/**
 * The capture slot, persisted in the function-file origin's localStorage.
 * On PowerPoint for Mac the ribbon runtime is torn down between button
 * clicks, so an in-memory slot would be lost between Copy and Paste.
 * localStorage survives because it is keyed to the add-in origin and
 * shared across runtime instances (it also survives a PowerPoint restart).
 */
export class LocalStorageCaptureSlot implements CaptureSlot {
  capture(g: Geometry): void {
    localStorage.setItem(KEY, JSON.stringify(g));
  }

  peek(): Geometry | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Geometry;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(KEY);
  }

  get isEmpty(): boolean {
    return localStorage.getItem(KEY) === null;
  }
}

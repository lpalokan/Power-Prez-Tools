import { ShapeGeometryPort } from "./shapeGeometryPort";
import { CaptureSlot } from "./captureSlot";
import { Geometry, positionOf, dimensionsOf } from "./geometry";

/** Raised when a paste is attempted before anything has been captured. */
export class NothingCapturedError extends Error {}

/** All capture/paste decision logic. Imports zero Office.js. */
export class CaptureService {
  constructor(
    private readonly port: ShapeGeometryPort,
    private readonly slot: CaptureSlot,
  ) {}

  async capture(): Promise<void> {
    const g = await this.port.getSelectedGeometry();
    this.slot.capture(g);
  }

  async pastePosition(): Promise<void> {
    await this.port.applyGeometry(positionOf(this.requireCaptured()));
  }

  async pasteDimensions(): Promise<void> {
    await this.port.applyGeometry(dimensionsOf(this.requireCaptured()));
  }

  async pasteBoth(): Promise<void> {
    await this.port.applyGeometry(this.requireCaptured());
  }

  private requireCaptured(): Geometry {
    const g = this.slot.peek();
    if (!g) throw new NothingCapturedError("Nothing has been captured yet.");
    return g;
  }
}

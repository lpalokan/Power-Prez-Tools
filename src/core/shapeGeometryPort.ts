import { Geometry, Position, Dimensions } from "./geometry";

/** Raised when the selection is not exactly one shape (zero or many). */
export class SelectionError extends Error {}

/** Raised when a selected object exposes no usable geometry. */
export class UnsupportedShapeError extends Error {}

/**
 * Boundary between pure logic and PowerPoint. Implementations:
 * OfficeShapeGeometryAdapter (real PowerPoint) and FakeShapeGeometryPort
 * (Cucumber tests, in Node). Pure logic depends only on this interface.
 */
export interface ShapeGeometryPort {
  /** Geometry of the single selected shape. Throws SelectionError if the
   * selection is not exactly one shape. */
  getSelectedGeometry(): Promise<Geometry>;
  applyPosition(p: Position): Promise<void>;
  applyDimensions(d: Dimensions): Promise<void>;
  applyGeometry(g: Geometry): Promise<void>;
}

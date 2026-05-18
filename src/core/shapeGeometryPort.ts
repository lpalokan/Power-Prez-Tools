import { Geometry } from "./geometry";

/** Raised when the selection is not exactly one shape (zero or many). */
export class SelectionError extends Error {}

/** Raised when a selected object exposes no usable geometry. */
export class UnsupportedShapeError extends Error {}

/**
 * The "exactly one selected shape" invariant — the single home for the
 * rule and its exact wording. Both the real OfficeShapeGeometryAdapter and
 * the Cucumber FakeShapeGeometryPort call this, so the contract can no
 * longer drift between them (it used to be hand-copied three times and
 * only reconciled during manual Mac testing). The error strings are
 * load-bearing: step definitions assert them by regex.
 */
export function requireExactlyOne<T>(selected: readonly T[]): T {
  if (selected.length === 0) throw new SelectionError("No shape selected.");
  if (selected.length > 1) throw new SelectionError("Select exactly one shape.");
  return selected[0];
}

/**
 * Boundary between pure logic and PowerPoint. Implementations:
 * OfficeShapeGeometryAdapter (real PowerPoint) and FakeShapeGeometryPort
 * (Cucumber tests, in Node). Pure logic depends only on this interface.
 *
 * Both methods enforce the selection invariant via requireExactlyOne.
 * applyGeometry sets only the fields present on the partial — which fields
 * to paste is a pure data decision in core (geometry.ts), not a fan-out of
 * port methods.
 */
export interface ShapeGeometryPort {
  /** Geometry of the single selected shape. Throws SelectionError if the
   * selection is not exactly one shape. */
  getSelectedGeometry(): Promise<Geometry>;
  /** Set only the provided fields on the single selected shape. Throws
   * SelectionError if the selection is not exactly one shape. */
  applyGeometry(partial: Partial<Geometry>): Promise<void>;
}

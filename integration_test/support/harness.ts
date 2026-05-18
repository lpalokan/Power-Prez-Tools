import { ShapeGeometryPort, requireExactlyOne } from "../../src/core/shapeGeometryPort";
import { Geometry } from "../../src/core/geometry";

/**
 * In-memory stand-in for PowerPoint used by the Cucumber suite. The
 * selection invariant and its error wording are no longer copied here:
 * both this fake and the real OfficeShapeGeometryAdapter call the one
 * core helper (requireExactlyOne), so the contract the step assertions
 * depend on cannot drift between them.
 */
export class FakeShapeGeometryPort implements ShapeGeometryPort {
  readonly shapes = new Map<string, Geometry>();
  private selectedIds: string[] = [];

  add(id: string, g: Geometry): void {
    this.shapes.set(id, g);
  }

  select(...ids: string[]): void {
    this.selectedIds = ids;
  }

  async getSelectedGeometry(): Promise<Geometry> {
    return { ...this.shapes.get(requireExactlyOne(this.selectedIds))! };
  }

  async applyGeometry(partial: Partial<Geometry>): Promise<void> {
    const id = requireExactlyOne(this.selectedIds);
    this.shapes.set(id, { ...this.shapes.get(id)!, ...partial });
  }
}

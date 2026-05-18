import { ShapeGeometryPort, SelectionError } from "../../src/core/shapeGeometryPort";
import { Geometry, Position, Dimensions } from "../../src/core/geometry";

/**
 * In-memory stand-in for PowerPoint used by the Cucumber suite. It must
 * honour the same ShapeGeometryPort contract (including error types and
 * messages) as the real OfficeShapeGeometryAdapter, since step assertions
 * depend on them. Contract drift only surfaces during manual Mac testing.
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

  private one(): string {
    if (this.selectedIds.length === 0) throw new SelectionError("No shape selected.");
    if (this.selectedIds.length > 1) throw new SelectionError("Select exactly one shape.");
    return this.selectedIds[0];
  }

  async getSelectedGeometry(): Promise<Geometry> {
    return { ...this.shapes.get(this.one())! };
  }

  async applyPosition(p: Position): Promise<void> {
    const id = this.one();
    this.shapes.set(id, { ...this.shapes.get(id)!, ...p });
  }

  async applyDimensions(d: Dimensions): Promise<void> {
    const id = this.one();
    this.shapes.set(id, { ...this.shapes.get(id)!, ...d });
  }

  async applyGeometry(g: Geometry): Promise<void> {
    this.shapes.set(this.one(), { ...g });
  }
}

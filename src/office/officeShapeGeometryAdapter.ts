import {
  ShapeGeometryPort,
  SelectionError,
  UnsupportedShapeError,
} from "../core/shapeGeometryPort";
import { Geometry, Position, Dimensions } from "../core/geometry";

/* global PowerPoint */

/**
 * The only PowerPoint-coupled file. Mirrors FakeShapeGeometryPort's
 * contract (same error types/messages). Verifiable only inside PowerPoint
 * on a Mac/Windows host, never in the Linux build container.
 */
export class OfficeShapeGeometryAdapter implements ShapeGeometryPort {
  async getSelectedGeometry(): Promise<Geometry> {
    return PowerPoint.run(async (ctx) => {
      const shapes = ctx.presentation.getSelectedShapes();
      shapes.load("items");
      await ctx.sync();
      if (shapes.items.length === 0) throw new SelectionError("No shape selected.");
      if (shapes.items.length > 1) throw new SelectionError("Select exactly one shape.");
      const s = shapes.items[0];
      s.load("left,top,width,height");
      await ctx.sync();
      const { left, top, width, height } = s;
      if ([left, top, width, height].some((v) => typeof v !== "number")) {
        throw new UnsupportedShapeError("The selected object has no geometry.");
      }
      return { left, top, width, height };
    });
  }

  applyPosition(p: Position): Promise<void> {
    return this.withSelected((s) => {
      s.left = p.left;
      s.top = p.top;
    });
  }

  applyDimensions(d: Dimensions): Promise<void> {
    return this.withSelected((s) => {
      s.width = d.width;
      s.height = d.height;
    });
  }

  applyGeometry(g: Geometry): Promise<void> {
    return this.withSelected((s) => {
      s.left = g.left;
      s.top = g.top;
      s.width = g.width;
      s.height = g.height;
    });
  }

  private withSelected(mutate: (s: PowerPoint.Shape) => void): Promise<void> {
    return PowerPoint.run(async (ctx) => {
      const shapes = ctx.presentation.getSelectedShapes();
      shapes.load("items");
      await ctx.sync();
      if (shapes.items.length === 0) throw new SelectionError("No shape selected.");
      if (shapes.items.length > 1) throw new SelectionError("Select exactly one shape.");
      mutate(shapes.items[0]);
      await ctx.sync();
    });
  }
}

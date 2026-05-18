import {
  ShapeGeometryPort,
  UnsupportedShapeError,
  requireExactlyOne,
} from "../core/shapeGeometryPort";
import { Geometry } from "../core/geometry";

/* global PowerPoint */

/**
 * The only PowerPoint-coupled file. The selection invariant and its error
 * wording live in core (requireExactlyOne); only the PowerPoint-specific
 * load/sync stays here, so the contract can no longer drift between this
 * adapter and the fake. Verifiable only inside PowerPoint on a Mac/Windows
 * host, never in the Linux build container.
 */
export class OfficeShapeGeometryAdapter implements ShapeGeometryPort {
  async getSelectedGeometry(): Promise<Geometry> {
    return PowerPoint.run(async (ctx) => {
      const shapes = ctx.presentation.getSelectedShapes();
      shapes.load("items");
      await ctx.sync();
      const s = requireExactlyOne(shapes.items);
      s.load("left,top,width,height");
      await ctx.sync();
      const { left, top, width, height } = s;
      if ([left, top, width, height].some((v) => typeof v !== "number")) {
        throw new UnsupportedShapeError("The selected object has no geometry.");
      }
      return { left, top, width, height };
    });
  }

  applyGeometry(partial: Partial<Geometry>): Promise<void> {
    return PowerPoint.run(async (ctx) => {
      const shapes = ctx.presentation.getSelectedShapes();
      shapes.load("items");
      await ctx.sync();
      const s = requireExactlyOne(shapes.items);
      if (partial.left !== undefined) s.left = partial.left;
      if (partial.top !== undefined) s.top = partial.top;
      if (partial.width !== undefined) s.width = partial.width;
      if (partial.height !== undefined) s.height = partial.height;
      await ctx.sync();
    });
  }
}

// All geometry values are in POINTS. The PowerPoint Office.js Shape API
// (left/top/width/height) uses points, NOT EMU. Do not introduce EMU
// conversion here; mixing units is the most likely future regression.

export interface Geometry {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type Position = Pick<Geometry, "left" | "top">;
export type Dimensions = Pick<Geometry, "width" | "height">;

export const positionOf = (g: Geometry): Position => ({ left: g.left, top: g.top });
export const dimensionsOf = (g: Geometry): Dimensions => ({ width: g.width, height: g.height });

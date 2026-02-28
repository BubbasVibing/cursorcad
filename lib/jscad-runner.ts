import { primitives, booleans, transforms, geometries } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

const SANDBOX_PRIMITIVES = {
  cuboid: primitives.cuboid,
  sphere: primitives.sphere,
  cylinder: primitives.cylinder,
  torus: primitives.torus,
  union: booleans.union,
  subtract: booleans.subtract,
  intersect: booleans.intersect,
  translate: transforms.translate,
  rotate: transforms.rotate,
  scale: transforms.scale,
  mirror: transforms.mirror,
} as const;

const PRIMITIVE_NAMES = Object.keys(SANDBOX_PRIMITIVES);
const PRIMITIVE_VALUES = Object.values(SANDBOX_PRIMITIVES);

export type JscadResult =
  | { ok: true; geometry: Geom3 }
  | { ok: false; error: string };

export function runJscad(code: string): JscadResult {
  try {
    const wrappedCode = `"use strict"; return (function() { ${code} })();`;
    const fn = new Function(...PRIMITIVE_NAMES, wrappedCode);
    const result = fn(...PRIMITIVE_VALUES);

    if (!geometries.geom3.isA(result)) {
      return { ok: false, error: "Code must return a geom3 object" };
    }

    return { ok: true, geometry: result as Geom3 };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

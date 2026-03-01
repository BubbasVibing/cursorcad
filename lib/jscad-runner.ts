import { primitives, booleans, transforms, geometries } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { JscadPart } from "@/lib/types";

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
  | { ok: true; parts: JscadPart[] }
  | { ok: false; error: string };

const MAX_CACHE_SIZE = 20;
const compilationCache = new Map<string, JscadResult>();

export function runJscad(code: string): JscadResult {
  const cached = compilationCache.get(code);
  if (cached) return cached;
  try {
    const wrappedCode = `"use strict"; return (function() { ${code} })();`;
    const fn = new Function(...PRIMITIVE_NAMES, wrappedCode);
    const result = fn(...PRIMITIVE_VALUES);

    // Single geom3 → wrap as one-part array
    if (geometries.geom3.isA(result)) {
      const okResult: JscadResult = { ok: true, parts: [{ geometry: result as Geom3 }] };
      cacheResult(code, okResult);
      return okResult;
    }

    // Array of parts → validate each element
    if (Array.isArray(result) && result.length > 0) {
      const parts: JscadPart[] = [];
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        // Each item must have a .geometry that is a geom3
        const geom = item?.geometry ?? item;
        if (!geometries.geom3.isA(geom)) {
          return {
            ok: false,
            error: `Array element [${i}] is not a valid geom3 object. Each element must be a geom3 or { geometry: geom3, color?: string, name?: string }.`,
          };
        }
        parts.push({
          geometry: geom as Geom3,
          color: typeof item?.color === "string" ? item.color : undefined,
          name: typeof item?.name === "string" ? item.name : undefined,
        });
      }
      const partsResult: JscadResult = { ok: true, parts };
      cacheResult(code, partsResult);
      return partsResult;
    }

    const failResult: JscadResult = {
      ok: false,
      error:
        "Code must return a geom3 object or an array of { geometry, color?, name? } parts.",
    };
    cacheResult(code, failResult);
    return failResult;
  } catch (err) {
    const errResult: JscadResult = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    cacheResult(code, errResult);
    return errResult;
  }
}

function cacheResult(code: string, result: JscadResult) {
  if (compilationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = compilationCache.keys().next().value;
    if (firstKey !== undefined) compilationCache.delete(firstKey);
  }
  compilationCache.set(code, result);
}

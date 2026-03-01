import { geometries } from "@jscad/modeling";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { JscadPart, ThreePart } from "@/lib/types";

/** Crease angle (radians): edges sharper than this get hard normals. */
const CREASE_ANGLE = Math.PI / 6; // 30 degrees

/** Convert a single JSCAD geom3 to a Three.js BufferGeometry with creased normals. */
export function jscadToThree(geom: Geom3): BufferGeometry {
  const polygons = geometries.geom3.toPolygons(geom);

  // Collect valid (non-degenerate) triangle positions
  const buf: number[] = [];

  for (const poly of polygons) {
    const verts = poly.vertices;
    // Fan-triangulate: vertex 0 is the hub
    for (let i = 1; i < verts.length - 1; i++) {
      const a = verts[0];
      const b = verts[i];
      const c = verts[i + 1];

      // Skip degenerate triangles (near-zero area)
      const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
      const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];
      const cx = aby * acz - abz * acy;
      const cy = abz * acx - abx * acz;
      const cz = abx * acy - aby * acx;
      if (cx * cx + cy * cy + cz * cz < 1e-14) continue;

      buf.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(buf), 3));
  geometry.computeVertexNormals();

  // toCreasedNormals: smooth normals on gentle curves, hard edges on sharp angles
  const creased = toCreasedNormals(geometry, CREASE_ANGLE);
  return mergeVertices(creased);
}

/** Convert an array of JscadParts to ThreeParts with creased normals. */
export function jscadPartsToThree(parts: JscadPart[]): ThreePart[] {
  return parts.map((part) => ({
    geometry: jscadToThree(part.geometry),
    color: part.color,
    name: part.name,
  }));
}

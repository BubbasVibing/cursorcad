import { geometries } from "@jscad/modeling";
import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { JscadPart, ThreePart } from "@/lib/types";

/** Convert a single JSCAD geom3 to a Three.js BufferGeometry with smooth normals. */
export function jscadToThree(geom: Geom3): BufferGeometry {
  const polygons = geometries.geom3.toPolygons(geom);

  // Pass 1: count total triangles for pre-allocation
  let triCount = 0;
  for (const poly of polygons) {
    triCount += poly.vertices.length - 2;
  }

  // Pass 2: fill pre-allocated Float32Array with indexed writes
  const positions = new Float32Array(triCount * 9);
  let offset = 0;

  for (const poly of polygons) {
    const verts = poly.vertices;
    // Fan-triangulate: vertex 0 is the hub
    for (let i = 1; i < verts.length - 1; i++) {
      const a = verts[0];
      const b = verts[i];
      const c = verts[i + 1];

      positions[offset++] = a[0]; positions[offset++] = a[1]; positions[offset++] = a[2];
      positions[offset++] = b[0]; positions[offset++] = b[1]; positions[offset++] = b[2];
      positions[offset++] = c[0]; positions[offset++] = c[1]; positions[offset++] = c[2];
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  return geometry;
}

/** Convert an array of JscadParts to ThreeParts with smooth normals. */
export function jscadPartsToThree(parts: JscadPart[]): ThreePart[] {
  return parts.map((part) => ({
    geometry: jscadToThree(part.geometry),
    color: part.color,
    name: part.name,
  }));
}

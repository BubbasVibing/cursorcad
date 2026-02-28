import { geometries } from "@jscad/modeling";
import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { JscadPart, ThreePart } from "@/lib/types";

/** Convert a single JSCAD geom3 to a Three.js BufferGeometry with smooth normals. */
export function jscadToThree(geom: Geom3): BufferGeometry {
  const polygons = geometries.geom3.toPolygons(geom);

  const positions: number[] = [];

  for (const poly of polygons) {
    const verts = poly.vertices;
    // Fan-triangulate: vertex 0 is the hub
    for (let i = 1; i < verts.length - 1; i++) {
      const a = verts[0];
      const b = verts[i];
      const c = verts[i + 1];

      positions.push(a[0], a[1], a[2]);
      positions.push(b[0], b[1], b[2]);
      positions.push(c[0], c[1], c[2]);
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

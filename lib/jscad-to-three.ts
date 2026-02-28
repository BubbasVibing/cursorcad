import { geometries } from "@jscad/modeling";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

export function jscadToThree(geom: Geom3): BufferGeometry {
  const polygons = geometries.geom3.toPolygons(geom);

  const positions: number[] = [];
  const normals: number[] = [];

  const vA = new Vector3();
  const vB = new Vector3();
  const vC = new Vector3();
  const cb = new Vector3();
  const ab = new Vector3();

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

      // Flat face normal via cross product
      vA.set(a[0], a[1], a[2]);
      vB.set(b[0], b[1], b[2]);
      vC.set(c[0], c[1], c[2]);
      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.cross(ab).normalize();

      normals.push(cb.x, cb.y, cb.z);
      normals.push(cb.x, cb.y, cb.z);
      normals.push(cb.x, cb.y, cb.z);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));

  return geometry;
}

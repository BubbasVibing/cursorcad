"use client";

/**
 * GeometryMesh -- R3F mesh that renders the generated 3D geometry.
 *
 * Currently a placeholder that returns null. When the JSCAD-to-Three.js
 * bridge is connected, this component will receive a BufferGeometry
 * prop and render it as a mesh with appropriate material.
 *
 * Props:
 *   geometry -- optional THREE.BufferGeometry from the JSCAD pipeline
 */

import type { BufferGeometry } from "three";

interface GeometryMeshProps {
  geometry?: BufferGeometry | null;
}

export default function GeometryMesh({ geometry }: GeometryMeshProps) {
  /* No geometry yet -- return nothing */
  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      {/* Standard physical material for 3D-printable part visualization */}
      <meshStandardMaterial
        color="#a8a8a8"
        roughness={0.6}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

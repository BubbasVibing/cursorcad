"use client";

/**
 * GeometryMesh -- R3F mesh that renders the generated 3D geometry.
 *
 * Supports solid and wireframe rendering modes.
 *
 * Props:
 *   geometry  -- optional THREE.BufferGeometry from the JSCAD pipeline
 *   wireframe -- whether to render in wireframe mode
 */

import type { BufferGeometry } from "three";

interface GeometryMeshProps {
  geometry?: BufferGeometry | null;
  wireframe?: boolean;
}

export default function GeometryMesh({ geometry, wireframe = false }: GeometryMeshProps) {
  if (!geometry) return null;

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#b0b0b8"
          roughness={0.6}
          metalness={0.1}
          flatShading
          wireframe={wireframe}
        />
      </mesh>
      {/* In wireframe mode, also render a faint solid underneath for depth */}
      {wireframe && (
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#b0b0b8"
            roughness={0.6}
            metalness={0.1}
            flatShading
            transparent
            opacity={0.08}
          />
        </mesh>
      )}
    </group>
  );
}

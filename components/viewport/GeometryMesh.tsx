"use client";

/**
 * GeometryMesh -- Renders one or more 3D parts from the JSCAD pipeline.
 *
 * Supports solid and wireframe rendering modes.
 * Each part gets its own color from the part data or a default palette.
 */

import type { ThreePart } from "@/lib/types";

const DEFAULT_PALETTE = [
  "#8b5cf6", // violet-500
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#a78bfa", // violet-400
  "#38bdf8", // sky-400
  "#fb923c", // orange-400
];

interface GeometryMeshProps {
  parts?: ThreePart[] | null;
  wireframe?: boolean;
}

export default function GeometryMesh({ parts, wireframe = false }: GeometryMeshProps) {
  if (!parts || parts.length === 0) return null;

  return (
    <group>
      {parts.map((part, i) => {
        const color = part.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
        return (
          <group key={i}>
            <mesh geometry={part.geometry} castShadow receiveShadow>
              <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.1}
                wireframe={wireframe}
              />
            </mesh>
            {wireframe && (
              <mesh geometry={part.geometry}>
                <meshStandardMaterial
                  color={color}
                  roughness={0.5}
                  metalness={0.1}
                  transparent
                  opacity={0.08}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

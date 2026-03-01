"use client";

/**
 * GeometryMesh -- Renders one or more 3D parts from the JSCAD pipeline.
 *
 * Wireframe mode shows two edge layers for engineering accuracy:
 *   1. WireframeGeometry — all mesh edges (lighter, shows full tessellation)
 *   2. EdgesGeometry — feature/hard edges only (darker, highlights structure)
 *
 * Supports part selection highlighting (dims unselected parts).
 * Each part gets its own color from the part data or a default palette.
 */

import { memo, useMemo } from "react";
import { EdgesGeometry, WireframeGeometry } from "three";
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

/** Threshold angle (degrees) for EdgesGeometry — only edges sharper than this are drawn. */
const EDGE_THRESHOLD_ANGLE = 30;

interface GeometryMeshProps {
  parts?: ThreePart[] | null;
  wireframe?: boolean;
  selectedPart?: number | null;
}

export default memo(function GeometryMesh({ parts, wireframe = false, selectedPart = null }: GeometryMeshProps) {
  if (!parts || parts.length === 0) return null;

  const hasSelection = selectedPart !== null;

  // All mesh edges — shows full tessellation structure (triangles on curved surfaces)
  const wireGeometries = useMemo(
    () => parts.map((part) => new WireframeGeometry(part.geometry)),
    [parts],
  );

  // Feature/hard edges only — highlights structural boundaries (sharp corners, holes, etc.)
  const edgeGeometries = useMemo(
    () => parts.map((part) => new EdgesGeometry(part.geometry, EDGE_THRESHOLD_ANGLE)),
    [parts],
  );

  return (
    <group>
      {parts.map((part, i) => {
        const color = part.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
        const isDimmed = hasSelection && selectedPart !== i;
        const opacity = isDimmed ? 0.15 : 1;

        return (
          <group key={i}>
            {/* Solid mesh — always rendered */}
            <mesh geometry={part.geometry} castShadow={!isDimmed} receiveShadow>
              <meshStandardMaterial
                color={color}
                roughness={0.5}
                metalness={0.1}
                transparent={wireframe || isDimmed}
                opacity={wireframe ? (isDimmed ? 0.05 : 0.12) : opacity}
              />
            </mesh>

            {/* All mesh edges — light lines showing tessellation */}
            {wireframe && (
              <lineSegments geometry={wireGeometries[i]}>
                <lineBasicMaterial
                  color={isDimmed ? "#d1d5db" : "#94a3b8"}
                  transparent
                  opacity={isDimmed ? 0.1 : 0.45}
                />
              </lineSegments>
            )}

            {/* Feature edges — bold lines on hard edges for structural clarity */}
            {wireframe && (
              <lineSegments geometry={edgeGeometries[i]}>
                <lineBasicMaterial
                  color={isDimmed ? "#9ca3af" : "#1e293b"}
                  transparent={isDimmed}
                  opacity={isDimmed ? 0.15 : 1}
                />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
});

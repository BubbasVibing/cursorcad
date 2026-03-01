"use client";

/**
 * GeometryMesh -- Renders one or more 3D parts from the JSCAD pipeline.
 *
 * Supports solid + structural-edge wireframe rendering (EdgesGeometry).
 * Supports part selection highlighting (dims unselected parts).
 * Each part gets its own color from the part data or a default palette.
 */

import { memo, useMemo } from "react";
import { EdgesGeometry } from "three";
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

  // Pre-compute EdgesGeometry for each part (only structural edges, not triangulation)
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
                opacity={wireframe ? (isDimmed ? 0.08 : 0.25) : opacity}
              />
            </mesh>

            {/* Structural edge lines — only in wireframe mode */}
            {wireframe && (
              <lineSegments geometry={edgeGeometries[i]}>
                <lineBasicMaterial
                  color={isDimmed ? "#9ca3af" : "#1e1e1e"}
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

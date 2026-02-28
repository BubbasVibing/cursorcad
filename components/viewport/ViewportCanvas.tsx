"use client";

/**
 * ViewportCanvas -- The core 3D scene for the CAD Cursor application.
 *
 * Theme: Light -- #e5e5ea canvas background, white platform, soft gray grid.
 *
 * Contains:
 *   - R3F Canvas with OrbitControls
 *   - White ground platform with gridHelper overlay
 *   - XYZ axis indicator lines (red/green/blue)
 *   - Grid size controls (+/- buttons) and reset-view button
 *   - JSCAD geometry rendering via GeometryMesh
 *   - HUD overlay, error overlay, and loading overlay
 *
 * PRESERVES all backend integration:
 *   - DEMO_CODE constant for default scene
 *   - runJscad() + jscadToThree() pipeline in useMemo
 *   - exportSTL() for STL file download
 *   - ViewportHUD with model info and export button
 *   - Error overlay for JSCAD compilation errors
 */

import { useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DoubleSide } from "three";
import GeometryMesh from "@/components/viewport/GeometryMesh";
import ViewportHUD from "@/components/viewport/ViewportHUD";
import LoadingOverlay from "@/components/viewport/LoadingOverlay";
import { runJscad } from "@/lib/jscad-runner";
import { jscadToThree } from "@/lib/jscad-to-three";
import { exportSTL } from "@/lib/stl-export";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

/* ---- Demo code shown when no user-generated code is present ---- */
const DEMO_CODE = `
const block = cuboid({ size: [4, 4, 4] });
const hole = cylinder({ radius: 1.2, height: 6 });
return subtract(block, hole);
`;

interface ViewportCanvasProps {
  jscadCode?: string | null;
}

/**
 * AxisLines -- Renders XYZ axis indicator lines at the origin.
 *
 * Uses native Three.js <line> primitives with bufferGeometry:
 *   - Red   (X axis): extends along +X
 *   - Green (Y axis): extends along +Y
 *   - Blue  (Z axis): extends along +Z
 */
function AxisLines({ length }: { length: number }) {
  /* Pre-compute axis vertex positions as Float32Arrays */
  const axes = useMemo(() => {
    const halfLen = length / 2;
    return {
      x: new Float32Array([0, 0, 0, halfLen, 0, 0]),
      y: new Float32Array([0, 0, 0, 0, halfLen, 0]),
      z: new Float32Array([0, 0, 0, 0, 0, halfLen]),
    };
  }, [length]);

  return (
    <group>
      {/* X axis -- red */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[axes.x, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" />
      </line>

      {/* Y axis -- green */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[axes.y, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22c55e" />
      </line>

      {/* Z axis -- blue */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[axes.z, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" />
      </line>
    </group>
  );
}

export default function ViewportCanvas({ jscadCode }: ViewportCanvasProps) {
  const code = jscadCode || DEMO_CODE;
  const isDemo = !jscadCode;

  /* ---- Grid size control ---- */
  const [gridSize, setGridSize] = useState(20);

  /* ---- OrbitControls ref for reset-view ---- */
  const controlsRef = useRef<OrbitControlsType>(null);

  /* ---- JSCAD pipeline: compile code -> geometry ---- */
  const { geometry, jscadGeom, error, faceCount } = useMemo(() => {
    const result = runJscad(code);
    if (result.ok) {
      const bufferGeom = jscadToThree(result.geometry);
      return {
        geometry: bufferGeom,
        jscadGeom: result.geometry,
        error: null as string | null,
        faceCount: bufferGeom.attributes.position.count / 3,
      };
    }
    return { geometry: null, jscadGeom: null as Geom3 | null, error: result.error, faceCount: null as number | null };
  }, [code]);

  /* ---- Export handler ---- */
  function handleExport() {
    if (jscadGeom) exportSTL(jscadGeom);
  }

  /* ---- Reset view to default camera position ---- */
  function handleResetView() {
    const controls = controlsRef.current;
    if (controls) {
      controls.reset();
    }
  }

  return (
    <div className="relative h-full w-full bg-gray-200">
      {/* HUD overlay on top of the canvas */}
      <ViewportHUD
        modelName={geometry ? (isDemo ? "Demo: Cube with hole" : "Generated Model") : null}
        faceCount={faceCount}
        isWatertight={geometry ? true : null}
        onExport={handleExport}
      />

      {/* ---- Error overlay (light theme) ---- */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-4 font-mono text-sm text-red-600 shadow-lg">
            <p className="mb-1 font-semibold">JSCAD Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading overlay (hidden by default) */}
      <LoadingOverlay visible={false} />

      {/* ---- Grid size controls (bottom-left) ---- */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5">
        {/* Decrease grid size */}
        <button
          onClick={() => setGridSize((s) => Math.max(10, s - 5))}
          className="
            pointer-events-auto flex h-7 w-7 items-center justify-center
            rounded-md bg-white/80 backdrop-blur-sm text-gray-500
            border border-gray-200 shadow-sm
            hover:bg-white hover:text-violet-500
            transition-all duration-150 text-xs font-bold
          "
          aria-label="Decrease grid size"
        >
          -
        </button>
        <span className="text-[10px] font-mono text-gray-500 min-w-[3ch] text-center">
          {gridSize}
        </span>
        {/* Increase grid size */}
        <button
          onClick={() => setGridSize((s) => Math.min(100, s + 5))}
          className="
            pointer-events-auto flex h-7 w-7 items-center justify-center
            rounded-md bg-white/80 backdrop-blur-sm text-gray-500
            border border-gray-200 shadow-sm
            hover:bg-white hover:text-violet-500
            transition-all duration-150 text-xs font-bold
          "
          aria-label="Increase grid size"
        >
          +
        </button>

        {/* Reset view button */}
        <button
          onClick={handleResetView}
          className="
            pointer-events-auto ml-2 flex h-7 items-center gap-1 px-2
            rounded-md bg-white/80 backdrop-blur-sm text-gray-500
            border border-gray-200 shadow-sm
            hover:bg-white hover:text-violet-500
            transition-all duration-150 text-[10px] font-medium
          "
          aria-label="Reset camera view"
        >
          {/* Reset icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM5.657 3.172a5.5 5.5 0 117.32 7.656l-.708-.708A4.5 4.5 0 105.5 8H7.25a.75.75 0 01.53 1.28l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5A.75.75 0 012.25 8H4a5.48 5.48 0 011.657-4.828z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>

      {/* ---- R3F Canvas ---- */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: "#e5e5ea" }} /* light grey canvas background */
      >
        {/* ---- Lighting (brighter for light theme) ---- */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 12, 5]} intensity={0.8} />
        <directionalLight position={[-4, 6, -8]} intensity={0.2} />

        {/* ---- Ground elements: remount when gridSize changes ---- */}
        <group key={gridSize}>
          {/* Grid lines -- transparent, no solid plane */}
          <gridHelper args={[gridSize, gridSize, "#000000", "#333333"]} position={[0, 0, 0]} />
        </group>

        {/* ---- XYZ axis lines ---- */}
        <AxisLines length={gridSize} />

        {/* ---- Camera controls ---- */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={500}
        />

        {/* ---- 3D geometry from JSCAD pipeline ---- */}
        <GeometryMesh geometry={geometry} />
      </Canvas>
    </div>
  );
}

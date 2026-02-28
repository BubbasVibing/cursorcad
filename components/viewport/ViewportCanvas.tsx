"use client";

/**
 * ViewportCanvas -- The core 3D scene for the CAD Cursor application.
 *
 * Theme: Light -- #eeeef2 canvas background, black grid lines.
 *
 * Contains:
 *   - R3F Canvas with OrbitControls, retina DPR, shadows, tone mapping
 *   - gridHelper overlay with XYZ axis indicator lines
 *   - Grid size controls (+/- buttons) and reset-view button
 *   - Multi-part JSCAD geometry rendering via GeometryMesh
 *   - HUD overlay, error overlay, and loading overlay
 */

import { useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import GeometryMesh from "@/components/viewport/GeometryMesh";
import ViewportHUD from "@/components/viewport/ViewportHUD";
import LoadingOverlay from "@/components/viewport/LoadingOverlay";
import { runJscad } from "@/lib/jscad-runner";
import { jscadPartsToThree } from "@/lib/jscad-to-three";
import { exportSTL } from "@/lib/stl-export";
import { export3MF } from "@/lib/3mf-export";
import type { JscadPart, ThreePart } from "@/lib/types";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

/* ---- Demo code: multi-part showcase ---- */
const DEMO_CODE = `
const block = cuboid({ size: [4, 4, 4] });
const hole = cylinder({ radius: 1.2, height: 6 });
const body = subtract(block, hole);
const knob = translate([0, 0, 3], cylinder({ radius: 0.8, height: 1.5 }));
return [
  { geometry: body, color: "#8b5cf6", name: "body" },
  { geometry: knob, color: "#60a5fa", name: "knob" },
];
`;

interface ViewportCanvasProps {
  jscadCode?: string | null;
  isGenerating?: boolean;
  modelDescription?: string | null;
}

/** Turn a user prompt into a safe filename slug. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "model";
}

/**
 * AxisLines -- Renders XYZ axis indicator lines at the origin.
 */
function AxisLines({ length }: { length: number }) {
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
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[axes.x, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[axes.y, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#22c55e" />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[axes.z, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" />
      </line>
    </group>
  );
}

export default function ViewportCanvas({ jscadCode, isGenerating, modelDescription }: ViewportCanvasProps) {
  const code = jscadCode || DEMO_CODE;
  const isDemo = !jscadCode;

  const [exportFormat, setExportFormat] = useState<"stl" | "3mf">("stl");
  const [wireframe, setWireframe] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const controlsRef = useRef<OrbitControlsType>(null);

  /* ---- JSCAD pipeline: compile code -> multi-part geometry ---- */
  const { parts, jscadParts, error, faceCount, partCount } = useMemo(() => {
    const result = runJscad(code);
    if (result.ok) {
      const threeParts = jscadPartsToThree(result.parts);
      const totalFaces = threeParts.reduce(
        (sum, p) => sum + p.geometry.attributes.position.count / 3,
        0,
      );
      return {
        parts: threeParts as ThreePart[],
        jscadParts: result.parts,
        error: null as string | null,
        faceCount: totalFaces,
        partCount: threeParts.length,
      };
    }
    return {
      parts: null as ThreePart[] | null,
      jscadParts: null as JscadPart[] | null,
      error: result.error,
      faceCount: null as number | null,
      partCount: null as number | null,
    };
  }, [code]);

  /* ---- Export handler ---- */
  function handleExport() {
    if (!jscadParts) return;
    const geoms = jscadParts.map((p) => p.geometry);
    const slug = modelDescription ? slugify(modelDescription) : "model";
    try {
      if (exportFormat === "3mf") {
        export3MF(geoms, `${slug}.3mf`);
      } else {
        exportSTL(geoms, `${slug}.stl`);
      }
    } catch (err) {
      console.error("[Export] Failed:", err);
      alert(`Export failed. Try the other format or regenerate the model.`);
    }
  }

  function handleResetView() {
    controlsRef.current?.reset();
  }

  return (
    <div className="relative h-full w-full bg-gray-200">
      <ViewportHUD
        modelName={parts ? (isDemo ? "Demo: Multi-part" : "Generated Model") : null}
        faceCount={faceCount}
        partCount={partCount}
        isWatertight={parts ? true : null}
        onExport={handleExport}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        wireframe={wireframe}
        onWireframeToggle={() => setWireframe((w) => !w)}
      />

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-4 font-mono text-sm text-red-600 shadow-lg">
            <p className="mb-1 font-semibold">JSCAD Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <LoadingOverlay visible={!!isGenerating} />

      {/* ---- Grid size controls (bottom-left) ---- */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM5.657 3.172a5.5 5.5 0 117.32 7.656l-.708-.708A4.5 4.5 0 105.5 8H7.25a.75.75 0 01.53 1.28l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5A.75.75 0 012.25 8H4a5.48 5.48 0 011.657-4.828z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>

      {/* ---- R3F Canvas with quality settings ---- */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "#eeeef2" }}
      >
        {/* ---- Lighting ---- */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 5]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <directionalLight position={[-4, 6, -8]} intensity={0.25} />
        <directionalLight position={[0, -4, 6]} intensity={0.15} />

        {/* ---- Grid: remount when gridSize changes ---- */}
        <group key={gridSize}>
          <gridHelper args={[gridSize, gridSize, "#000000", "#333333"]} position={[0, 0, 0]} />
        </group>

        <AxisLines length={gridSize} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={500}
        />

        {/* ---- Multi-part 3D geometry from JSCAD pipeline ---- */}
        <GeometryMesh parts={parts} wireframe={wireframe} />
      </Canvas>
    </div>
  );
}

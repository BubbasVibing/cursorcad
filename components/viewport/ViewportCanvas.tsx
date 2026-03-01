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

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds } from "@react-three/drei";
import { ACESFilmicToneMapping, Box3, Vector3 } from "three";
import GeometryMesh from "@/components/viewport/GeometryMesh";
import ViewportHUD from "@/components/viewport/ViewportHUD";
import PartsList from "@/components/viewport/PartsList";
import ShortcutsHelp from "@/components/viewport/ShortcutsHelp";
import { runJscad } from "@/lib/jscad-runner";
import { jscadPartsToThree } from "@/lib/jscad-to-three";
import type { JscadPart, ThreePart } from "@/lib/types";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

const CANVAS_STYLE = { background: "#eeeef2" } as const;

/* ---- Demo code shown when no user-generated code is present ---- */
const DEMO_CODE = `
const block = cuboid({ size: [4, 4, 4] });
const hole = cylinder({ radius: 1.2, height: 6, segments: 32 });
return subtract(block, hole);
`;

interface ViewportCanvasProps {
  jscadCode?: string | null;
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

/**
 * BoundsController -- Lives inside <Bounds> to expose zoom-to-fit and view-preset APIs.
 */
function BoundsController({
  zoomToFitRef,
  viewPresetRef,
}: {
  zoomToFitRef: React.MutableRefObject<(() => void) | null>;
  viewPresetRef: React.MutableRefObject<((preset: "top" | "front" | "right" | "iso") => void) | null>;
}) {
  const bounds = useBounds();

  zoomToFitRef.current = () => {
    bounds.refresh().fit();
  };

  viewPresetRef.current = (preset) => {
    const size = bounds.getSize();
    const dist = Math.max(size.distance, 10);

    const positions: Record<string, [number, number, number]> = {
      top:   [0, dist, 0.01],
      front: [0, 0, dist],
      right: [dist, 0, 0],
      iso:   [dist * 0.7, dist * 0.5, dist * 0.7],
    };

    bounds.refresh().to({
      position: positions[preset],
      target: [0, 0, 0],
    });
  };

  return null;
}

/**
 * ScreenshotHelper -- Lives inside <Canvas> to access gl/scene/camera for screenshots.
 */
function ScreenshotHelper({
  captureRef,
  modelSlug,
}: {
  captureRef: React.MutableRefObject<(() => void) | null>;
  modelSlug: string;
}) {
  const { gl, scene, camera } = useThree();

  captureRef.current = () => {
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${modelSlug}-screenshot.png`;
    a.click();
  };

  return null;
}

export default function ViewportCanvas({ jscadCode, modelDescription }: ViewportCanvasProps) {
  const code = jscadCode || DEMO_CODE;
  const isDemo = !jscadCode;

  const [exportFormat, setExportFormat] = useState<"stl" | "3mf">("stl");
  const [wireframe, setWireframe] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const controlsRef = useRef<OrbitControlsType>(null);
  const zoomToFitRef = useRef<(() => void) | null>(null);
  const viewPresetRef = useRef<((preset: "top" | "front" | "right" | "iso") => void) | null>(null);
  const screenshotRef = useRef<(() => void) | null>(null);

  /* ---- JSCAD pipeline: compile code -> multi-part geometry ---- */
  const { parts, jscadParts, error, faceCount, partCount, dimensions } = useMemo(() => {
    const result = runJscad(code);
    if (result.ok) {
      const threeParts = jscadPartsToThree(result.parts);
      const totalFaces = threeParts.reduce(
        (sum, p) => sum + p.geometry.attributes.position.count / 3,
        0,
      );

      // Compute bounding box dimensions
      const box = new Box3();
      for (const p of threeParts) {
        p.geometry.computeBoundingBox();
        if (p.geometry.boundingBox) {
          box.union(p.geometry.boundingBox);
        }
      }
      const size = new Vector3();
      box.getSize(size);

      return {
        parts: threeParts as ThreePart[],
        jscadParts: result.parts,
        error: null as string | null,
        faceCount: totalFaces,
        partCount: threeParts.length,
        dimensions: { width: size.x, height: size.y, depth: size.z },
      };
    }
    return {
      parts: null as ThreePart[] | null,
      jscadParts: null as JscadPart[] | null,
      error: result.error,
      faceCount: null as number | null,
      partCount: null as number | null,
      dimensions: null as { width: number; height: number; depth: number } | null,
    };
  }, [code]);

  // Reset selected part when code changes
  useEffect(() => {
    setSelectedPart(null);
  }, [code]);

  /* ---- Keyboard shortcuts ---- */
  const handleZoomToFit = useCallback(() => zoomToFitRef.current?.(), []);
  const handleViewPreset = useCallback((p: "top" | "front" | "right" | "iso") => viewPresetRef.current?.(p), []);
  const handleScreenshot = useCallback(() => screenshotRef.current?.(), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "f":
          e.preventDefault();
          handleZoomToFit();
          break;
        case "w":
          e.preventDefault();
          setWireframe((w) => !w);
          break;
        case "1":
          handleViewPreset("front");
          break;
        case "2":
          handleViewPreset("right");
          break;
        case "3":
          handleViewPreset("top");
          break;
        case "4":
          handleViewPreset("iso");
          break;
        case "Escape":
          setSelectedPart(null);
          setShowShortcuts(false);
          break;
        case "?":
          setShowShortcuts((s) => !s);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleZoomToFit, handleViewPreset]);

  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), []);
  const handleToggleWireframe = useCallback(() => setWireframe((w) => !w), []);

  /* ---- Export handler ---- */
  const handleExport = useCallback(async function handleExport() {
    if (!jscadParts) return;
    const geoms = jscadParts.map((p) => p.geometry);
    const slug = modelDescription ? slugify(modelDescription) : "model";
    try {
      if (exportFormat === "3mf") {
        const { export3MF } = await import("@/lib/3mf-export");
        await export3MF(geoms, `${slug}.3mf`);
      } else {
        const { exportSTL } = await import("@/lib/stl-export");
        await exportSTL(geoms, `${slug}.stl`);
      }
    } catch (err) {
      console.error("[Export] Failed:", err);
      alert(`Export failed. Try the other format or regenerate the model.`);
    }
  }, [jscadParts, exportFormat, modelDescription]);

  const handleResetView = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  return (
    <div className="relative h-full w-full bg-gray-200">
      <ViewportHUD
        modelName={parts ? (isDemo ? "Demo: Cube with hole" : modelDescription || "Generated Model") : null}
        faceCount={faceCount}
        partCount={partCount}
        isWatertight={parts ? true : null}
        dimensions={dimensions}
        onExport={handleExport}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        wireframe={wireframe}
        onWireframeToggle={handleToggleWireframe}
        onZoomToFit={handleZoomToFit}
        onScreenshot={handleScreenshot}
      />

      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-4 font-mono text-sm text-red-600 shadow-lg">
            <p className="mb-1 font-semibold">JSCAD Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ---- Parts list (bottom-left, above controls) ---- */}
      {parts && partCount != null && partCount > 1 && (
        <div className="absolute bottom-[4.5rem] left-4 z-20">
          <PartsList
            parts={parts}
            selectedPartIndex={selectedPart}
            onSelectPart={setSelectedPart}
          />
        </div>
      )}

      {/* ---- Bottom-left controls: view presets + grid ---- */}
      <div className="absolute bottom-4 left-4 z-20 flex items-end gap-3">
        {/* View preset buttons */}
        <div className="pointer-events-auto flex items-center gap-1">
          {(["front", "right", "top", "iso"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => handleViewPreset(preset)}
              className="
                flex h-7 items-center gap-1 px-1.5
                rounded-md bg-white/80 backdrop-blur-sm text-gray-500
                border border-gray-200 shadow-sm
                hover:bg-white hover:text-violet-500
                transition-all duration-150 text-[10px] font-medium
                active:scale-95
              "
              aria-label={`${preset} view`}
              title={`${preset.charAt(0).toUpperCase() + preset.slice(1)} view (${preset === "front" ? "1" : preset === "right" ? "2" : preset === "top" ? "3" : "4"})`}
            >
              {preset === "front" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                  <rect x="3" y="3" width="10" height="10" rx="1" strokeWidth="0" />
                </svg>
              )}
              {preset === "right" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                  <path d="M5 2l8 3v8l-8 3V2z" />
                </svg>
              )}
              {preset === "top" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                  <path d="M2 5l6-3 6 3-6 3-6-3z" />
                </svg>
              )}
              {preset === "iso" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                  <path d="M8 1l7 4v6l-7 4-7-4V5l7-4zm0 1.5L2.5 6 8 9.5 13.5 6 8 2.5z" />
                </svg>
              )}
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300/50" />

        {/* Grid size controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => setGridSize((s) => Math.max(10, s - 5))}
            className="
              flex h-7 w-7 items-center justify-center
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
              flex h-7 w-7 items-center justify-center
              rounded-md bg-white/80 backdrop-blur-sm text-gray-500
              border border-gray-200 shadow-sm
              hover:bg-white hover:text-violet-500
              transition-all duration-150 text-xs font-bold
            "
            aria-label="Increase grid size"
          >
            +
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300/50" />

        {/* Reset + Fit buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={handleResetView}
            className="
              flex h-7 items-center gap-1 px-2
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

          <button
            onClick={handleZoomToFit}
            className="
              flex h-7 items-center gap-1 px-2
              rounded-md bg-white/80 backdrop-blur-sm text-gray-500
              border border-gray-200 shadow-sm
              hover:bg-white hover:text-violet-500
              transition-all duration-150 text-[10px] font-medium
            "
            aria-label="Zoom to fit (F)"
            title="Zoom to fit (F)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path d="M2 2h4v1.5H3.5V6H2V2zm8 0h4v4h-1.5V3.5H10V2zM2 10h1.5v2.5H6V14H2v-4zm10 2.5V10h1.5v4h-4v-1.5H12z" />
            </svg>
            Fit
          </button>
        </div>
      </div>

      {/* ---- Shortcuts help overlay ---- */}
      <ShortcutsHelp
        visible={showShortcuts}
        onClose={handleCloseShortcuts}
      />

      {/* ---- R3F Canvas with quality settings ---- */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          preserveDrawingBuffer: true,
        }}
        style={CANVAS_STYLE}
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

        {/* ---- Multi-part 3D geometry with Bounds for zoom-to-fit ---- */}
        {/* Rotate -90° around X to map JSCAD Z-up to Three.js Y-up */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Bounds maxDuration={0.8} margin={1.2}>
            <GeometryMesh parts={parts} wireframe={wireframe} selectedPart={selectedPart} />
            <BoundsController zoomToFitRef={zoomToFitRef} viewPresetRef={viewPresetRef} />
          </Bounds>
        </group>

        {/* ---- Screenshot helper ---- */}
        <ScreenshotHelper
          captureRef={screenshotRef}
          modelSlug={modelDescription ? slugify(modelDescription) : "model"}
        />
      </Canvas>
    </div>
  );
}

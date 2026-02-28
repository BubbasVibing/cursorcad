"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import GeometryMesh from "@/components/viewport/GeometryMesh";
import ViewportHUD from "@/components/viewport/ViewportHUD";
import LoadingOverlay from "@/components/viewport/LoadingOverlay";
import { runJscad } from "@/lib/jscad-runner";
import { jscadToThree } from "@/lib/jscad-to-three";
import { exportSTL } from "@/lib/stl-export";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

const DEMO_CODE = `
const block = cuboid({ size: [4, 4, 4] });
const hole = cylinder({ radius: 1.2, height: 6 });
return subtract(block, hole);
`;

interface ViewportCanvasProps {
  jscadCode?: string | null;
}

export default function ViewportCanvas({ jscadCode }: ViewportCanvasProps) {
  const code = jscadCode || DEMO_CODE;
  const isDemo = !jscadCode;

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

  function handleExport() {
    if (jscadGeom) exportSTL(jscadGeom);
  }

  return (
    <div className="relative h-full w-full bg-zinc-900">
      {/* HUD overlay on top of the canvas */}
      <ViewportHUD
        modelName={geometry ? (isDemo ? "Demo: Cube with hole" : "Generated Model") : null}
        faceCount={faceCount}
        isWatertight={geometry ? true : null}
        onExport={handleExport}
      />

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/80">
          <div className="max-w-md rounded-lg border border-red-800 bg-zinc-900 p-4 font-mono text-sm text-red-400">
            <p className="mb-1 font-semibold">JSCAD Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading overlay (hidden by default) */}
      <LoadingOverlay visible={false} />

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: "#18181b" }} /* zinc-900 */
      >
        {/* ---- Lighting ---- */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 5]} intensity={0.8} />
        <directionalLight position={[-4, 6, -8]} intensity={0.2} />

        {/* ---- Ground grid ---- */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#27272a"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3f3f46"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
          position={[0, 0, 0]}
        />

        {/* ---- Camera controls ---- */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={50}
        />

        {/* ---- 3D geometry ---- */}
        <GeometryMesh geometry={geometry} />
      </Canvas>
    </div>
  );
}

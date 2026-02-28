"use client";

/**
 * ViewportCanvas -- The inner R3F Canvas component that renders the 3D scene.
 *
 * Separated into its own file so the parent Viewport.tsx can dynamically
 * import it with `ssr: false`. Three.js and R3F cannot run on the server.
 *
 * Scene setup:
 *   - Dark background matching the application theme
 *   - Ambient + directional lighting for balanced illumination
 *   - OrbitControls for camera interaction (rotate, zoom, pan)
 *   - Subtle ground-plane grid
 *   - GeometryMesh placeholder (renders nothing until geometry is provided)
 */

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import GeometryMesh from "@/components/viewport/GeometryMesh";
import ViewportHUD from "@/components/viewport/ViewportHUD";
import LoadingOverlay from "@/components/viewport/LoadingOverlay";

export default function ViewportCanvas() {
  return (
    <div className="relative h-full w-full bg-zinc-900">
      {/* HUD overlay on top of the canvas */}
      <ViewportHUD />

      {/* Loading overlay (hidden by default) */}
      <LoadingOverlay visible={false} />

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: "#18181b" }} /* zinc-900 */
      >
        {/* ---- Lighting ---- */}
        {/* Soft ambient fill so shadows aren't pitch black */}
        <ambientLight intensity={0.4} />
        {/* Primary directional light from upper-right */}
        <directionalLight position={[8, 12, 5]} intensity={0.8} />
        {/* Subtle back-fill to reduce harsh contrast */}
        <directionalLight position={[-4, 6, -8]} intensity={0.2} />

        {/* ---- Ground grid ---- */}
        <Grid
          args={[20, 20]}          /* 20x20 unit grid */
          cellSize={1}             /* 1 unit between minor lines */
          cellThickness={0.5}
          cellColor="#27272a"       /* zinc-800: subtle minor lines */
          sectionSize={5}           /* major line every 5 units */
          sectionThickness={1}
          sectionColor="#3f3f46"    /* zinc-700: slightly brighter major lines */
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

        {/* ---- 3D geometry placeholder ---- */}
        <GeometryMesh />
      </Canvas>
    </div>
  );
}

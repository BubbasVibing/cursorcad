"use client";

/**
 * Viewport -- Wrapper that dynamically imports the R3F Canvas at runtime.
 *
 * CRITICAL: Three.js and React Three Fiber cannot be server-side rendered.
 * This component uses Next.js `dynamic()` with `ssr: false` to ensure the
 * Canvas and all Three.js code only runs in the browser.
 *
 * The dynamic import targets ViewportCanvas, which contains the actual
 * <Canvas>, lighting, grid, controls, and overlays.
 */

import dynamic from "next/dynamic";

/* Dynamic import with SSR disabled for the R3F scene */
const ViewportCanvas = dynamic(
  () => import("@/components/viewport/ViewportCanvas"),
  {
    ssr: false,
    /* Show a minimal loading state while the 3D engine initializes */
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
          <span className="text-xs text-zinc-500">Loading 3D viewport...</span>
        </div>
      </div>
    ),
  }
);

interface ViewportProps {
  jscadCode?: string | null;
}

export default function Viewport({ jscadCode }: ViewportProps) {
  return (
    <div className="h-full w-full">
      <ViewportCanvas jscadCode={jscadCode} />
    </div>
  );
}

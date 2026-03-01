"use client";

/**
 * Viewport -- Wrapper that dynamically imports the R3F Canvas at runtime.
 *
 * CRITICAL: Three.js and React Three Fiber cannot be server-side rendered.
 * This component uses Next.js `dynamic()` with `ssr: false` to ensure the
 * Canvas and all Three.js code only runs in the browser.
 *
 * Theme: Light -- gray-200 loading bg, violet-500 spinner accent.
 */

import dynamic from "next/dynamic";

/* Dynamic import with SSR disabled for the R3F scene */
const ViewportCanvas = dynamic(
  () => import("@/components/viewport/ViewportCanvas"),
  {
    ssr: false,
    /* Show a minimal loading state while the 3D engine initializes */
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-200">
        <div className="flex flex-col items-center gap-3">
          {/* Spinner ring: violet accent */}
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-violet-500" />
          <span className="text-xs text-gray-400">Loading 3D viewport...</span>
        </div>
      </div>
    ),
  }
);

interface ViewportProps {
  jscadCode?: string | null;
  modelDescription?: string | null;
}

export default function Viewport({ jscadCode, modelDescription }: ViewportProps) {
  return (
    <div className="h-full w-full">
      <ViewportCanvas jscadCode={jscadCode} modelDescription={modelDescription} />
    </div>
  );
}

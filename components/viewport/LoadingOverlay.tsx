/**
 * LoadingOverlay -- Centered overlay for the viewport during model generation.
 *
 * Theme: Light frosted-glass -- white/80 card with backdrop blur, violet spinner.
 *
 * Cycles through sequential status messages while visible:
 *   "Interpreting prompt..." -> "Generating geometry..." -> "Compiling model..."
 *
 * When visible becomes false the inner component unmounts; when it becomes true
 * again a fresh instance mounts with messageIndex reset to 0.
 */

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "Interpreting prompt...",
  "Generating geometry...",
  "Compiling model...",
];

const CYCLE_INTERVAL_MS = 2200;

interface LoadingOverlayProps {
  visible?: boolean;
}

/**
 * Inner component that manages the cycling timer.
 * Mounted fresh each time visible transitions to true (messageIndex starts at 0).
 */
function LoadingContent() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/90 px-10 py-7 shadow-xl backdrop-blur-md border border-gray-100/80">
        {/* Spinner ring: violet accent */}
        <div className="h-8 w-8 animate-spin rounded-full border-[2.5px] border-gray-200 border-t-violet-500" />

        {/* Status message with smooth crossfade */}
        <p className="text-sm font-medium text-gray-500 transition-all duration-300">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}

export default function LoadingOverlay({ visible = false }: LoadingOverlayProps) {
  if (!visible) return null;
  return <LoadingContent />;
}

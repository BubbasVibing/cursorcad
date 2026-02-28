"use client";

/**
 * ViewportHUD -- Informational overlays on the 3D viewport.
 *
 * Theme: Light -- gray-600/gray-400 text for readability on light canvas,
 * violet accents on interactive elements. Semantic colors preserved
 * (emerald = watertight, amber = not watertight).
 *
 * Absolutely positioned on top of the Canvas. Displays:
 *   - Top-left:     model name (or "No model" when empty)
 *   - Top-right:    face count / watertight status
 *   - Bottom-left:  axis indicator labels
 *   - Bottom-right: export button (disabled when no model)
 *
 * Props:
 *   modelName   -- display name of the current model
 *   faceCount   -- number of triangular faces
 *   isWatertight -- whether the mesh is manifold/watertight
 *   onExport    -- callback for the export button
 */

interface ViewportHUDProps {
  modelName?: string | null;
  faceCount?: number | null;
  isWatertight?: boolean | null;
  onExport?: () => void;
}

export default function ViewportHUD({
  modelName = null,
  faceCount = null,
  isWatertight = null,
  onExport,
}: ViewportHUDProps) {
  const hasModel = !!modelName;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-4 font-mono text-xs">
      {/* ---- Top row ---- */}
      <div className="flex items-start justify-between">
        {/* Top-left: model name */}
        <span className={hasModel ? "text-gray-600" : "text-gray-400"}>
          {hasModel ? modelName : "No model"}
        </span>

        {/* Top-right: face count + watertight status */}
        <div className="flex items-center gap-3 text-gray-400">
          <span>
            {faceCount != null ? `${faceCount.toLocaleString()} faces` : "-- faces"}
          </span>
          <span className="flex items-center gap-1">
            {/* Small status dot: semantic colors (emerald/amber) preserved */}
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isWatertight === true
                  ? "bg-emerald-500" /* semantic: watertight = green */
                  : isWatertight === false
                    ? "bg-amber-500" /* semantic: not watertight = amber */
                    : "bg-gray-300"
              }`}
            />
            {isWatertight === true
              ? "Watertight"
              : isWatertight === false
                ? "Not watertight"
                : "--"}
          </span>
        </div>
      </div>

      {/* ---- Bottom row ---- */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        {/* Bottom-left: axis indicator */}
        <div className="flex gap-2 text-[10px]">
          <span className="text-red-500/70">X</span>
          <span className="text-green-500/70">Y</span>
          <span className="text-blue-500/70">Z</span>
        </div>

        {/* Bottom-right: export button -- violet accent on hover */}
        {hasModel && (
          <button
            onClick={onExport}
            className="
              pointer-events-auto rounded-lg border border-gray-200
              bg-white/80 px-3 py-1.5 text-xs text-gray-600
              backdrop-blur-sm shadow-sm transition-all duration-150
              hover:border-violet-500 hover:text-violet-500
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
              active:scale-95
            "
          >
            {/* Download/export icon */}
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M8 1a.75.75 0 01.75.75v6.69l2.22-2.22a.75.75 0 011.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06l2.22 2.22V1.75A.75.75 0 018 1z" />
                <path d="M2.75 11.5a.75.75 0 01.75.75v1.5h9v-1.5a.75.75 0 011.5 0v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5v-1.5a.75.75 0 01.75-.75z" />
              </svg>
              Export STL
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

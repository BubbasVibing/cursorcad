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
 *   - Bottom-right: format toggle + export button (disabled when no model)
 */

export type ExportFormat = "stl" | "3mf";

interface ViewportHUDProps {
  modelName?: string | null;
  faceCount?: number | null;
  isWatertight?: boolean | null;
  onExport?: () => void;
  exportFormat?: ExportFormat;
  onExportFormatChange?: (format: ExportFormat) => void;
  wireframe?: boolean;
  onWireframeToggle?: () => void;
}

export default function ViewportHUD({
  modelName = null,
  faceCount = null,
  isWatertight = null,
  onExport,
  exportFormat = "stl",
  onExportFormatChange,
  wireframe = false,
  onWireframeToggle,
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

        {/* Bottom-right: wireframe toggle + format toggle + export button */}
        {hasModel && (
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Wireframe toggle */}
            <button
              onClick={onWireframeToggle}
              className={`
                rounded-lg border px-2.5 py-1.5 text-xs
                backdrop-blur-sm shadow-sm transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                active:scale-95
                ${wireframe
                  ? "border-violet-500 bg-violet-50 text-violet-600"
                  : "border-gray-200 bg-white/80 text-gray-500 hover:border-violet-500 hover:text-violet-500"
                }
              `}
              aria-label="Toggle wireframe"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M8 1l7 4v6l-7 4-7-4V5l7-4zm0 1.528L2.5 6v4l5.5 3.472L13.5 10V6L8 2.528z" />
                  <path d="M8 5.5L2.5 8.5 8 11.5 13.5 8.5 8 5.5z" opacity="0.3" />
                </svg>
                Wire
              </span>
            </button>

            {/* Format toggle: STL / 3MF pill */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => onExportFormatChange?.("stl")}
                className={`
                  px-2.5 py-1.5 text-xs font-medium transition-all duration-150
                  ${exportFormat === "stl"
                    ? "bg-violet-500 text-white"
                    : "text-gray-500 hover:text-violet-500"
                  }
                `}
              >
                STL
              </button>
              <button
                onClick={() => onExportFormatChange?.("3mf")}
                className={`
                  px-2.5 py-1.5 text-xs font-medium transition-all duration-150
                  ${exportFormat === "3mf"
                    ? "bg-violet-500 text-white"
                    : "text-gray-500 hover:text-violet-500"
                  }
                `}
              >
                3MF
              </button>
            </div>

            {/* Export button */}
            <button
              onClick={onExport}
              className="
                rounded-lg border border-gray-200
                bg-white/80 px-3 py-1.5 text-xs text-gray-600
                backdrop-blur-sm shadow-sm transition-all duration-150
                hover:border-violet-500 hover:text-violet-500
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                active:scale-95
              "
            >
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
                Export {exportFormat.toUpperCase()}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * PartsList — Collapsible panel listing all parts in the current scene.
 *
 * Displays each part with a color swatch, name, and triangle face count.
 * Clicking a row selects/deselects it. The panel collapses via a chevron
 * toggle in the header. Styled with glass-morphism to match the app theme.
 *
 * Props:
 * - parts: Array of ThreePart objects currently in the scene
 * - selectedPartIndex: Index of the currently selected part (null = none)
 * - onSelectPart: Callback to select a part by index, or null to deselect
 */

import { useState, memo } from "react";
import type { ThreePart } from "@/lib/types";

/* Default color palette — cycled for parts without an explicit color */
const DEFAULT_COLORS = [
  "#8b5cf6", /* violet */
  "#60a5fa", /* blue */
  "#34d399", /* emerald */
  "#fbbf24", /* amber */
  "#f87171", /* red */
  "#a78bfa", /* light violet */
  "#38bdf8", /* sky */
  "#fb923c", /* orange */
];

interface PartsListProps {
  parts: ThreePart[];
  selectedPartIndex: number | null;
  onSelectPart: (index: number | null) => void;
}

export default memo(function PartsList({
  parts,
  selectedPartIndex,
  onSelectPart,
}: PartsListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  /** Resolve a part's display color, falling back to the cycling palette */
  const getPartColor = (part: ThreePart, index: number): string =>
    part.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

  /** Compute triangle count from the position attribute vertex count */
  const getFaceCount = (part: ThreePart): number => {
    const posAttr = part.geometry?.attributes?.position;
    return posAttr ? Math.floor(posAttr.count / 3) : 0;
  };

  /* Don't render anything when there are no parts */
  if (parts.length === 0) return null;

  return (
    <div className="w-48 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm select-none">

      {/* ── Header — "Parts (N)" + chevron toggle ── */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer"
      >
        <span className="text-[10px] font-medium text-gray-500">
          Parts ({parts.length})
        </span>

        {/* Chevron icon — rotates 180° when collapsed */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? "" : "-rotate-180"
          }`}
        >
          <path
            d="M2 6.5L5 3.5L8 6.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── Parts rows — shown only when expanded ── */}
      {isExpanded && (
        <ul
          className={`pb-1 ${
            parts.length > 6 ? "max-h-[180px] overflow-y-auto" : ""
          }`}
        >
          {parts.map((part, index) => {
            const isSelected = selectedPartIndex === index;
            const color = getPartColor(part, index);
            const name = part.name || `Part ${index + 1}`;
            const faces = getFaceCount(part);

            return (
              <li
                key={index}
                onClick={() => onSelectPart(isSelected ? null : index)}
                className={`
                  flex items-center gap-2 px-3 py-1.5
                  text-[10px] text-gray-600
                  cursor-pointer transition-colors duration-150
                  ${isSelected
                    ? "bg-violet-50 border-l-2 border-violet-500"
                    : "hover:bg-gray-50 border-l-2 border-transparent"
                  }
                `}
              >
                {/* Color swatch — 10x10 circle */}
                <span
                  className="shrink-0 w-[10px] h-[10px] rounded-full"
                  style={{ backgroundColor: color }}
                />

                {/* Part name — truncate if long */}
                <span className="truncate flex-1">{name}</span>

                {/* Triangle face count — right-aligned, muted */}
                <span className="text-gray-400 shrink-0 tabular-nums">
                  {faces.toLocaleString()}△
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

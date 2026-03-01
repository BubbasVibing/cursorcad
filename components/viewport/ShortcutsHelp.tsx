"use client";

import { Fragment, memo } from "react";

/**
 * ShortcutsHelp -- Floating keyboard shortcuts reference card for the CAD viewport.
 *
 * Positioned at bottom-center of the viewport, above the toolbar controls.
 * Uses glass-morphism styling consistent with the white/violet app theme.
 * Only renders when `visible` is true (conditional rendering, not CSS display).
 *
 * Props:
 * - visible: Controls whether the overlay is shown
 * - onClose: Callback fired when the user clicks the close button
 */

interface ShortcutsHelpProps {
  visible: boolean;
  onClose: () => void;
}

/** Shortcut definition: keyboard key label + human-readable action description. */
const SHORTCUTS = [
  { key: "[", action: "Toggle sidebar" },
  { key: "]", action: "Toggle chat" },
  { key: "E", action: "Engineering tools" },
  { key: "F", action: "Zoom to fit" },
  { key: "W", action: "Toggle wireframe" },
  { key: "1", action: "Front view" },
  { key: "2", action: "Right view" },
  { key: "3", action: "Top view" },
  { key: "4", action: "Isometric view" },
  { key: "Esc", action: "Deselect / close" },
  { key: "?", action: "Toggle this help" },
] as const;

export default memo(function ShortcutsHelp({ visible, onClose }: ShortcutsHelpProps) {
  if (!visible) return null;

  return (
    /* Container: bottom-center, above toolbar (bottom-14), glass-morphism card */
    <div
      className="
        pointer-events-auto absolute bottom-14 left-1/2 z-30
        -translate-x-1/2 rounded-xl border border-gray-200
        bg-white/90 shadow-xl backdrop-blur-md
      "
    >
      {/* ---- Header row: title + close button ---- */}
      <div className="flex items-center justify-between gap-6 px-3 pt-2.5 pb-1.5">
        <span className="text-xs font-semibold text-gray-700">
          Keyboard Shortcuts
        </span>

        {/* Close button -- inline SVG X icon */}
        <button
          onClick={onClose}
          className="
            flex h-4 w-4 items-center justify-center rounded
            text-gray-400 transition-colors duration-150
            hover:text-gray-600
          "
          aria-label="Close shortcuts help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3 w-3"
          >
            <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z" />
          </svg>
        </button>
      </div>

      {/* ---- Shortcuts table: two-column grid (key | action) ---- */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 pb-2.5">
        {SHORTCUTS.map(({ key, action }) => (
          <Fragment key={key}>
            {/* Key badge */}
            <kbd
              className="
                inline-flex h-5 min-w-[20px] items-center justify-center
                rounded border border-gray-300 bg-gray-100
                px-1.5 font-mono text-[10px] font-medium text-gray-600
              "
            >
              {key}
            </kbd>

            {/* Action label */}
            <span className="flex items-center text-[10px] text-gray-500">
              {action}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
});

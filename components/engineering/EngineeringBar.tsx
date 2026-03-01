"use client";

import { useState } from "react";
import TransformPanel from "@/components/engineering/TransformPanel";
import type { TransformValues } from "@/components/engineering/TransformPanel";
import MeasureTool from "@/components/engineering/MeasureTool";
import CrossSectionTool from "@/components/engineering/CrossSectionTool";

type ToolId = "transform" | "measure" | "section" | null;

interface EngineeringBarProps {
  visible: boolean;
  leftSidebarOpen: boolean;
  chatOpen: boolean;
  panelWidth: number;
  transformValues: TransformValues;
  onTransformChange: (type: "position" | "rotation" | "scale", axis: 0 | 1 | 2, value: number) => void;
  onTransformReset: () => void;
  snapToGrid: boolean;
  onSnapToggle: () => void;
}

const TOOLS: { id: ToolId; label: string; icon: React.ReactNode }[] = [
  {
    id: "transform",
    label: "Transform",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M8 1a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 1z" />
        <path d="M2 10a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14v-3.25A.75.75 0 012.75 10z" opacity="0.5" />
        <path d="M14 10a.75.75 0 01.75.75V14a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2.5A.75.75 0 0114 10z" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "measure",
    label: "Measure",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1H2V3zm0 3h2v1H2V6zm3 0h2v1H5V6zm3 0h2v1H8V6zm3 0h2v1h-2V6zM2 9h12v1H2V9zm0 3h12a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" />
      </svg>
    ),
  },
  {
    id: "section",
    label: "Section",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M8 1l7 4v6l-7 4-7-4V5l7-4z" opacity="0.3" />
        <path d="M1 8h14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

export default function EngineeringBar({
  visible,
  leftSidebarOpen,
  chatOpen,
  panelWidth,
  transformValues,
  onTransformChange,
  onTransformReset,
  snapToGrid,
  onSnapToggle,
}: EngineeringBarProps) {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  if (!visible) return null;

  const leftOffset = leftSidebarOpen ? 280 + 20 + 12 : 20;
  const rightOffset = chatOpen ? panelWidth + 20 + 12 : 20;

  const handleToolClick = (id: ToolId) => {
    setActiveTool((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="
        absolute z-20 bottom-4
        rounded-xl shadow-xl
        bg-white/80 backdrop-blur-xl
        border border-gray-200/60
        overflow-hidden
        transition-all duration-300 ease-in-out
      "
      style={{ left: leftOffset, right: rightOffset }}
    >
      {/* ---- Toolbar strip ---- */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
              text-xs font-medium transition-all duration-150
              ${activeTool === tool.id
                ? "bg-violet-50 text-violet-600 border border-violet-200"
                : "text-gray-500 hover:bg-gray-50 border border-transparent"
              }
            `}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 mx-1" />

        {/* Snap toggle */}
        <button
          onClick={onSnapToggle}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            text-xs font-medium transition-all duration-150
            ${snapToGrid
              ? "bg-violet-50 text-violet-600 border border-violet-200"
              : "text-gray-500 hover:bg-gray-50 border border-transparent"
            }
          `}
          title="Snap to grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zm-8 8h6v6H1V9zm8 0h6v6H9V9z" opacity="0.3" />
            <path d="M3 3h2v2H3V3zm8 0h2v2h-2V3zm-8 8h2v2H3v-2zm8 0h2v2h-2v-2z" />
          </svg>
          Snap
        </button>
      </div>

      {/* ---- Active tool content ---- */}
      {activeTool && (
        <div className="border-t border-gray-200/60 px-3 py-2">
          {activeTool === "transform" && (
            <TransformPanel
              values={transformValues}
              onChange={onTransformChange}
              onReset={onTransformReset}
            />
          )}
          {activeTool === "measure" && <MeasureTool />}
          {activeTool === "section" && <CrossSectionTool />}
        </div>
      )}
    </div>
  );
}

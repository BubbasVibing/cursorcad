"use client";

import { useCallback } from "react";

export interface TransformValues {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

interface TransformPanelProps {
  values: TransformValues;
  onChange: (type: "position" | "rotation" | "scale", axis: 0 | 1 | 2, value: number) => void;
  onReset: () => void;
}

const AXIS_COLORS = ["text-red-500", "text-green-500", "text-blue-500"] as const;
const AXIS_LABELS = ["X", "Y", "Z"] as const;

function AxisInput({
  axis,
  value,
  onChange,
  step,
}: {
  axis: 0 | 1 | 2;
  value: number;
  onChange: (value: number) => void;
  step: number;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) onChange(v);
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-1">
      <span className={`text-[10px] font-bold w-4 text-center ${AXIS_COLORS[axis]}`}>
        {AXIS_LABELS[axis]}
      </span>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        step={step}
        className="
          w-full h-7 px-2 rounded-md
          border border-gray-200 bg-white/80
          text-xs font-mono text-gray-700
          focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400
          transition-colors duration-150
        "
      />
    </div>
  );
}

export default function TransformPanel({
  values,
  onChange,
  onReset,
}: TransformPanelProps) {
  const sections: {
    label: string;
    type: "position" | "rotation" | "scale";
    step: number;
    data: [number, number, number];
  }[] = [
    { label: "Position", type: "position", step: 0.5, data: values.position },
    { label: "Rotation", type: "rotation", step: 5, data: values.rotation },
    { label: "Scale", type: "scale", step: 0.1, data: values.scale },
  ];

  return (
    <div className="flex items-start gap-6">
      {sections.map(({ label, type, step, data }) => (
        <div key={type} className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </div>
          <div className="space-y-1">
            {([0, 1, 2] as const).map((axis) => (
              <AxisInput
                key={axis}
                axis={axis}
                value={data[axis]}
                onChange={(v) => onChange(type, axis, v)}
                step={step}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Reset button */}
      <div className="pt-5">
        <button
          onClick={onReset}
          className="
            flex h-7 items-center gap-1 px-2
            rounded-md bg-white/80 border border-gray-200
            text-[10px] font-medium text-gray-500
            hover:text-violet-500 hover:border-violet-300
            transition-all duration-150
          "
          title="Reset transforms"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM5.657 3.172a5.5 5.5 0 117.32 7.656l-.708-.708A4.5 4.5 0 105.5 8H7.25a.75.75 0 01.53 1.28l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5A.75.75 0 012.25 8H4a5.48 5.48 0 011.657-4.828z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}

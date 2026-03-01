"use client";

export default function MeasureTool() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5 text-gray-400 shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3v18h18M7 16l4-8 4 4 4-8"
        />
      </svg>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Measure Tool</span>
          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
            Coming soon
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Click two points to measure distance, angles, and radii between features.
        </p>
      </div>
    </div>
  );
}

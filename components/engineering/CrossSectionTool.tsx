"use client";

export default function CrossSectionTool() {
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
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="3 3" />
      </svg>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Cross Section</span>
          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
            Coming soon
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Slice through your model on any plane to inspect internal geometry.
        </p>
      </div>
    </div>
  );
}

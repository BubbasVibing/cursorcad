"use client";

import { useRef, useEffect } from "react";

type StreamStatus = "thinking" | "streaming" | "validating" | "retrying";

interface CodeStreamSnippetProps {
  code: string;
  status: StreamStatus;
  attempt?: number;
}

const STATUS_LABELS: Record<StreamStatus, string> = {
  thinking: "Thinking...",
  streaming: "Writing code...",
  validating: "Validating...",
  retrying: "Fixing issues...",
};

const STATUS_COLORS: Record<StreamStatus, string> = {
  thinking: "bg-violet-400",
  streaming: "bg-emerald-400",
  validating: "bg-amber-400",
  retrying: "bg-orange-400",
};

export default function CodeStreamSnippet({
  code,
  status,
  attempt,
}: CodeStreamSnippetProps) {
  const codeRef = useRef<HTMLPreElement>(null);

  /* Auto-scroll to bottom as code streams in */
  useEffect(() => {
    const el = codeRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [code]);

  return (
    <div className="flex justify-start px-4 py-1">
      <div className="w-full max-w-[95%] overflow-hidden rounded-xl border border-gray-200/40 shadow-sm">
        {/* Status header */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2">
          <span
            className={`inline-block h-2 w-2 rounded-full animate-pulse ${STATUS_COLORS[status]}`}
          />
          <span className="text-xs font-medium text-gray-500">
            {STATUS_LABELS[status]}
            {attempt && attempt > 1 ? ` (attempt ${attempt})` : ""}
          </span>
        </div>

        {/* Dark code block */}
        <pre
          ref={codeRef}
          className="max-h-[200px] overflow-y-auto bg-[#1a1a2e] p-3 text-xs leading-relaxed"
        >
          <code className="font-mono text-gray-300 whitespace-pre-wrap break-words">
            {code}
            {(status === "thinking" || status === "streaming") && (
              <span className="inline-block w-[2px] h-[14px] ml-[1px] align-middle bg-violet-400 animate-[cursor-blink_1s_step-end_infinite]" />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

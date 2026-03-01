"use client";

import type { DesignSession } from "@/lib/types";
import SessionCard from "@/components/sidebar/SessionCard";

interface HistoryPanelProps {
  sessions: DesignSession[];
  activeSessionId: string | null;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function HistoryPanel({
  sessions,
  activeSessionId,
  onLoadSession,
  onDeleteSession,
}: HistoryPanelProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 text-gray-300 mb-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
        <p className="text-xs text-gray-400">No previous designs</p>
        <p className="text-[10px] text-gray-300 mt-1">
          Your saved sessions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-1 py-1">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          isActive={session.id === activeSessionId}
          onLoad={onLoadSession}
          onDelete={onDeleteSession}
        />
      ))}
    </div>
  );
}

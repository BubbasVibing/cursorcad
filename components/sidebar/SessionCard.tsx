"use client";

import { memo } from "react";
import type { SessionListItem } from "@/lib/types";

interface SessionCardProps {
  session: SessionListItem;
  isActive: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

function relativeTime(timestamp: number | string): string {
  const ts = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default memo(function SessionCard({
  session,
  isActive,
  onLoad,
  onDelete,
}: SessionCardProps) {
  return (
    <button
      onClick={() => onLoad(session.id)}
      className={`
        group relative w-full text-left px-3 py-2.5 rounded-lg
        transition-all duration-150
        ${isActive
          ? "bg-violet-50 border-l-2 border-violet-500 pl-2.5"
          : "hover:bg-gray-50 border-l-2 border-transparent"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-700 truncate flex-1">
          {session.title}
        </span>
        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
          {relativeTime(session.updatedAt)}
        </span>
      </div>

      {session.lastMessage && (
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
          {session.lastMessage}
        </p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        className="
          absolute right-2 top-2 hidden group-hover:flex
          h-5 w-5 items-center justify-center rounded
          text-gray-400 hover:text-red-500 hover:bg-red-50
          transition-colors duration-150
        "
        aria-label="Delete session"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z" />
        </svg>
      </button>
    </button>
  );
});

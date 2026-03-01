"use client";

import { useState } from "react";
import type { DesignSession, CadSettings } from "@/lib/types";
import HistoryPanel from "@/components/sidebar/HistoryPanel";
import SettingsPanel from "@/components/sidebar/SettingsPanel";

interface LeftSidebarProps {
  open: boolean;
  onToggle: () => void;
  sessions: DesignSession[];
  activeSessionId: string | null;
  settings: CadSettings;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewDesign: () => void;
  onSettingsChange: (settings: CadSettings) => void;
}

export default function LeftSidebar({
  open,
  sessions,
  activeSessionId,
  settings,
  onLoadSession,
  onDeleteSession,
  onNewDesign,
  onSettingsChange,
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

  return (
    <aside
      className={`
        absolute z-30 flex flex-col
        rounded-2xl shadow-2xl
        bg-white/70 backdrop-blur-xl
        border border-white/50
        overflow-hidden
        transition-all duration-300 ease-in-out
        ${open ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"}
      `}
      style={{
        top: 20,
        left: 20,
        bottom: 20,
        width: 280,
      }}
    >
      {/* ---- Header ---- */}
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200/60 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4.5 w-4.5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Explorer</h2>
          <p className="text-xs text-gray-400">Designs & settings</p>
        </div>
      </header>

      {/* ---- New Design button ---- */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNewDesign}
          className="
            flex w-full items-center justify-center gap-1.5
            bg-violet-500 text-white rounded-lg h-9
            text-xs font-medium
            hover:bg-violet-600 active:scale-[0.98]
            transition-all duration-150
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
          </svg>
          New Design
        </button>
      </div>

      {/* ---- Tab switcher ---- */}
      <div className="mx-3 mb-2">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab("history")}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded-md
              transition-all duration-150
              ${activeTab === "history"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded-md
              transition-all duration-150
              ${activeTab === "settings"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            Settings
          </button>
        </div>
      </div>

      {/* ---- Tab content ---- */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "history" ? (
          <HistoryPanel
            sessions={sessions}
            activeSessionId={activeSessionId}
            onLoadSession={onLoadSession}
            onDeleteSession={onDeleteSession}
          />
        ) : (
          <SettingsPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        )}
      </div>
    </aside>
  );
}

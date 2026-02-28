"use client";

/**
 * ChatPanel -- Left-side chat interface for the CAD Cursor application.
 *
 * Layout (flex column, full height of left pane):
 *   1. Header bar with app name and logo mark
 *   2. Scrollable message area (shows welcome state when empty)
 *   3. InputBar pinned at the bottom
 *
 * Calls /api/generate to get JSCAD code from Claude, then notifies
 * the parent via onCodeGenerated so the Viewport can render the model.
 */

import { useState, useRef, useEffect } from "react";
import InputBar from "@/components/chat/InputBar";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickPromptChips from "@/components/chat/QuickPromptChips";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  onCodeGenerated?: (code: string) => void;
}

export default function ChatPanel({ onCodeGenerated }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---- Auto-scroll to bottom when new messages arrive ---- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isGenerating]);

  /* ---- Handle sending a message ---- */
  const handleSend = async (content: string) => {
    /* Add user message */
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      const data = await res.json();

      if (!res.ok) {
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Error: ${data.error || "Something went wrong"}`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      /* Notify parent with the generated code */
      onCodeGenerated?.(data.code);

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Model generated — check the viewport.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Error: Failed to reach the server. Is the dev server running?",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* ---- Header bar ---- */}
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-5 py-4">
        {/* Logo mark: stylized cube icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4.5 w-4.5 text-white"
          >
            <path d="M10 1l8 4.5v9L10 19l-8-4.5v-9L10 1zm0 1.528L3.5 6.5v7l6.5 3.972L16.5 13.5v-7L10 2.528z" />
            <path d="M10 6.5L3.5 10 10 13.5 16.5 10 10 6.5z" opacity="0.4" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">CAD Cursor</h1>
          <p className="text-xs text-zinc-500">Prompt to 3D print</p>
        </div>
      </header>

      {/* ---- Scrollable message area ---- */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {!hasMessages ? (
          /* ---- Empty/welcome state ---- */
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
            {/* Welcome icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7 text-zinc-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </div>

            {/* Welcome text */}
            <div className="text-center">
              <h2 className="text-base font-medium text-zinc-300">
                Describe a part to get started
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500">
                Type a description or pick an example below
              </p>
            </div>

            {/* Quick prompt chips */}
            <QuickPromptChips onSelect={handleSend} />
          </div>
        ) : (
          /* ---- Message list ---- */
          <div className="space-y-1">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}
            {/* Show typing indicator while generating */}
            {isGenerating && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* ---- Input bar pinned at bottom ---- */}
      <InputBar onSend={handleSend} disabled={isGenerating} />
    </div>
  );
}

"use client";

/**
 * InputBar -- Chat input field with send button, pinned to the bottom of ChatPanel.
 *
 * Features:
 *   - Auto-expanding <textarea> (grows with content, max 5 rows)
 *   - Enter to send, Shift+Enter for newline
 *   - Disabled state while generation is in progress
 *   - Simple inline SVG send icon (no icon library)
 *
 * Props:
 *   onSend     -- callback with the message text (defaults to console.log)
 *   disabled   -- disables the input and send button
 */

import { useRef, useState, useCallback, type KeyboardEvent } from "react";

interface InputBarProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled = false }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---- Auto-resize the textarea to fit content ---- */
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; /* reset so scrollHeight recalculates */
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; /* cap at ~5 rows */
  }, []);

  /* ---- Send handler ---- */
  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    if (onSend) {
      onSend(trimmed);
    } else {
      console.log("[InputBar] send:", trimmed);
    }

    setValue("");

    /* Reset height after clearing */
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    });
  }, [value, disabled, onSend]);

  /* ---- Keyboard shortcut: Enter to send, Shift+Enter for newline ---- */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-3">
      <div
        className="
          flex items-end gap-2 rounded-xl border border-zinc-700
          bg-zinc-900 px-3 py-2
          transition-colors duration-150
          focus-within:border-emerald-600
        "
      >
        {/* Textarea input */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          placeholder="Describe a part..."
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          className="
            max-h-[160px] min-h-[24px] flex-1 resize-none
            bg-transparent text-sm text-zinc-100
            placeholder:text-zinc-500
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        />

        {/* Send button with inline SVG arrow icon */}
        <button
          onClick={send}
          disabled={disabled || isEmpty}
          aria-label="Send message"
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg transition-all duration-150
            bg-emerald-600 text-white
            hover:bg-emerald-500
            disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
            active:scale-95
          "
        >
          {/* Arrow-up send icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.55.24l4 4.5a.75.75 0 11-1.1 1.02L10.75 5.66V16a.75.75 0 01-1.5 0V5.66L6.55 8.76a.75.75 0 11-1.1-1.02l4-4.5A.75.75 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

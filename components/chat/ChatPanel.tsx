"use client";

/**
 * ChatPanel -- Right-side floating chat interface for the CAD Cursor application.
 *
 * Layout (flex column, full height of the floating island):
 *   1. Header bar with app name and violet logo mark
 *   2. Scrollable message area (shows welcome state when empty)
 *   3. InputBar pinned at the bottom
 *
 * Theme: Light/glass-morphism -- white backgrounds, violet-500 accents,
 * gray text hierarchy. The parent island container provides the glass blur,
 * so this component uses transparent/translucent backgrounds.
 *
 * Calls /api/generate to get JSCAD code from Claude, then notifies
 * the parent via onCodeGenerated so the Viewport can render the model.
 */

import { useState, useRef, useEffect } from "react";
import InputBar from "@/components/chat/InputBar";
import type { ImageData } from "@/components/chat/InputBar";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickPromptChips from "@/components/chat/QuickPromptChips";
import { runJscad } from "@/lib/jscad-runner";
import type { ConversationMessage } from "@/lib/types";

const MAX_ATTEMPTS = 3;

function buildRetryPrompt(
  originalPrompt: string,
  failedCode: string,
  errorMessage: string,
): string {
  return `Original request: ${originalPrompt}

Your previous code failed with the following error when executed in the JSCAD sandbox:

--- FAILED CODE ---
${failedCode}
--- END CODE ---

Runtime error: ${errorMessage}

Please fix the code. Remember:
- Use ONLY the 11 available primitives (cuboid, sphere, cylinder, torus, union, subtract, intersect, translate, rotate, scale, mirror)
- No imports, no exports, no console.log
- The code must return either a single geom3 object or an array of { geometry, color?, name? } parts
- Output raw code only, no markdown fences or explanation`;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
}

interface ChatPanelProps {
  onCodeGenerated?: (code: string) => void;
  onGeneratingChange?: (generating: boolean) => void;
  currentCode?: string | null;
  onPromptSent?: (prompt: string) => void;
}

export default function ChatPanel({ onCodeGenerated, onGeneratingChange, currentCode, onPromptSent }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /** Conversation history sent to Claude (separate from UI messages). */
  const conversationRef = useRef<ConversationMessage[]>([]);

  /** Guard against rapid double-sends before isGenerating state propagates. */
  const sendingRef = useRef(false);

  /* ---- Auto-scroll to bottom when new messages arrive ---- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isGenerating]);

  /* ---- Handle sending a message (with retry loop) ---- */
  const handleSend = async (content: string, image?: ImageData) => {
    /* Prevent rapid double-sends */
    if (sendingRef.current) return;
    sendingRef.current = true;

    const hasImage = !!image;

    /* Add user message to UI */
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      imageDataUrl: image?.dataUrl,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    onGeneratingChange?.(true);

    /* Track conversation for Claude */
    conversationRef.current.push({ role: "user", content });
    onPromptSent?.(content);

    /* Detect if this is an edit (model already exists in viewport) */
    const isEdit = !!currentCode;

    try {
      let lastError = "";
      let lastFailedCode = "";

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        /* Build the messages array for this attempt.
         * First attempt: use conversationRef as-is.
         * Retries: append the failed code + retry prompt as temporary messages
         * WITHOUT persisting to conversationRef. */
        let attemptMessages: ConversationMessage[];

        if (attempt === 1) {
          attemptMessages = [...conversationRef.current];
        } else {
          /* Temporary messages for retry — not persisted */
          attemptMessages = [
            ...conversationRef.current,
            { role: "assistant", content: lastFailedCode },
            { role: "user", content: buildRetryPrompt(content, lastFailedCode, lastError) },
          ];
        }

        /* 1. Call /api/generate — include image only on first attempt */
        const fetchBody: Record<string, unknown> = {
          messages: attemptMessages,
          currentCode,
        };
        if (hasImage && attempt === 1) {
          fetchBody.imageBase64 = image.base64;
          fetchBody.imageMediaType = image.mediaType;
        }

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fetchBody),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          /* Response wasn't JSON (e.g. HTML 502/504 from gateway) */
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "Error: Server returned an unexpected response. Please try again.",
          };
          setMessages((prev) => [...prev, assistantMsg]);
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to generate valid code for that request.",
          });
          return;
        }

        /* 2. API error — show error, no retry */
        if (!res.ok) {
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          /* Persist failure to maintain alternation */
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to generate valid code for that request.",
          });
          return;
        }

        /* Check for vision "Unable to identify" response */
        if (hasImage && data.code && data.code.includes("Unable to identify")) {
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "I couldn't identify the object in that photo. Try a clearer image or describe the shape in words instead.",
          };
          setMessages((prev) => [...prev, assistantMsg]);
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to identify the object in the photo.",
          });
          return;
        }

        /* 3. Validate code in sandbox */
        const result = runJscad(data.code);

        /* 4. Success — notify parent and show message */
        if (result.ok) {
          onCodeGenerated?.(data.code);

          if (attempt > 1) {
            console.log(`[ChatPanel] Attempt ${attempt}/${MAX_ATTEMPTS} succeeded after retry`);
          }

          const label = hasImage
            ? "Model generated from your photo"
            : isEdit
              ? "Model updated"
              : "Model generated";

          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content:
              attempt === 1
                ? `${label} — check the viewport.`
                : `${label} after ${attempt} attempts — check the viewport.`,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          /* Persist the actual code as assistant turn */
          conversationRef.current.push({ role: "assistant", content: data.code });
          return;
        }

        /* 5. Sandbox error — log and prepare for retry */
        lastError = result.error;
        lastFailedCode = data.code;
        console.warn(
          `[ChatPanel] Attempt ${attempt}/${MAX_ATTEMPTS} failed sandbox validation: ${result.error}`,
        );
      }

      /* All attempts exhausted */
      console.error(`[ChatPanel] All ${MAX_ATTEMPTS} attempts failed. Last error: ${lastError}`);
      const exhaustedMessage = hasImage
        ? "The object might be too complex for the available primitives. Try describing the shape in words instead."
        : "Sorry, I wasn't able to generate valid geometry for that description. Try rephrasing your request or simplifying the shape.";
      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: exhaustedMessage,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      /* Persist failure to maintain alternation */
      conversationRef.current.push({
        role: "assistant",
        content: "I was unable to generate valid code for that request.",
      });
    } catch {
      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Error: Failed to reach the server. Is the dev server running?",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      /* Persist failure to maintain alternation */
      conversationRef.current.push({
        role: "assistant",
        content: "I was unable to generate valid code for that request.",
      });
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
      sendingRef.current = false;
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* ---- Header bar ---- */}
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200/60 px-5 py-4">
        {/* Logo mark: stylized cube icon on violet background */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500">
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
          <h1 className="text-sm font-semibold text-gray-800">CAD Cursor</h1>
          <p className="text-xs text-gray-400">Prompt to 3D print</p>
        </div>
      </header>

      {/* ---- Scrollable message area ---- */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {!hasMessages ? (
          /* ---- Empty/welcome state ---- */
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
            {/* Welcome icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7 text-violet-400"
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
              <h2 className="text-base font-medium text-gray-700">
                Describe a part to get started
              </h2>
              <p className="mt-1.5 text-sm text-gray-400">
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
                imageDataUrl={msg.imageDataUrl}
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

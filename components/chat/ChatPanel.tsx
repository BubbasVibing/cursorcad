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
 * Streams code from /api/generate in real-time, displaying it in a
 * CodeStreamSnippet. After validation, notifies the parent via
 * onCodeGenerated so the Viewport can render the model.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import InputBar from "@/components/chat/InputBar";
import type { ImageData } from "@/components/chat/InputBar";
import MessageBubble from "@/components/chat/MessageBubble";
import CodeStreamSnippet from "@/components/chat/CodeStreamSnippet";
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
- Use ONLY the 13 available primitives (cuboid, sphere, cylinder, torus, polygon, extrudeRotate, union, subtract, intersect, translate, rotate, scale, mirror)
- No imports, no exports, no console.log
- The code must return either a single geom3 object or an array of { geometry, color?, name? } parts
- Output raw code only, no markdown fences or explanation`;
}

/**
 * Parse NDJSON from a ReadableStream, calling onLine for each parsed JSON object.
 * Handles partial lines that split across chunks.
 */
async function readNDJSON(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onLine: (data: { type: string; text?: string; code?: string; error?: string }) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onLine(JSON.parse(trimmed));
      } catch {
        console.warn("[ChatPanel] Failed to parse NDJSON line:", trimmed);
      }
    }
  }

  if (buffer.trim()) {
    try {
      onLine(JSON.parse(buffer.trim()));
    } catch {
      console.warn("[ChatPanel] Failed to parse final NDJSON buffer:", buffer);
    }
  }
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
  onMessagesChange?: (messages: import("@/lib/types").ConversationMessage[]) => void;
  initialMessages?: import("@/lib/types").ConversationMessage[];
}

export default function ChatPanel({ onCodeGenerated, onGeneratingChange, currentCode, onPromptSent, onMessagesChange, initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role,
        content: m.content,
      }));
    }
    return [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Streaming state */
  const [streamingCode, setStreamingCode] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<"thinking" | "streaming" | "validating" | "retrying">("thinking");
  const [streamAttempt, setStreamAttempt] = useState(1);

  /** Conversation history sent to Claude (separate from UI messages). */
  const conversationRef = useRef<ConversationMessage[]>(initialMessages ? [...initialMessages] : []);

  /** Guard against rapid double-sends before isGenerating state propagates. */
  const sendingRef = useRef(false);

  /* ---- Notify parent when messages change ---- */
  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(
        messages.map((m) => ({ role: m.role, content: m.content }))
      );
    }
  }, [messages, onMessagesChange]);

  /* ---- Auto-scroll to bottom when new messages arrive ---- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  /* Scroll when streaming code updates */
  useEffect(() => {
    if (streamingCode === null) return;
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [streamingCode]);

  /* ---- Handle sending a message (with streaming + retry loop) ---- */
  const handleSend = useCallback(async (content: string, image?: ImageData) => {
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

    /* Initialize streaming UI */
    setStreamingCode("");
    setStreamStatus("thinking");
    setStreamAttempt(1);

    try {
      let lastError = "";
      let lastFailedCode = "";

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        setStreamAttempt(attempt);

        if (attempt > 1) {
          setStreamingCode("");
          setStreamStatus("retrying");
          await new Promise((r) => setTimeout(r, 800));
          setStreamStatus("thinking");
        }

        let attemptMessages: ConversationMessage[];

        if (attempt === 1) {
          attemptMessages = [...conversationRef.current];
        } else {
          attemptMessages = [
            ...conversationRef.current,
            { role: "assistant", content: lastFailedCode },
            { role: "user", content: buildRetryPrompt(content, lastFailedCode, lastError) },
          ];
        }

        /* Build fetch body — include image only on first attempt */
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

        /* Non-streaming error responses (400, 500, etc.) */
        if (!res.ok) {
          let data;
          try {
            data = await res.json();
          } catch {
            data = { error: "Server returned an unexpected response" };
          }

          setStreamingCode(null);
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to generate valid code for that request.",
          });
          return;
        }

        /* Stream the response */
        const reader = res.body?.getReader();
        if (!reader) {
          setStreamingCode(null);
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "Error: No response stream available.",
          };
          setMessages((prev) => [...prev, assistantMsg]);
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to generate valid code for that request.",
          });
          return;
        }

        let finalCode: string | null = null;
        let streamError: string | null = null;
        let accumulatedCode = "";

        await readNDJSON(reader, (data) => {
          if (data.type === "delta" && data.text) {
            accumulatedCode += data.text;
            setStreamingCode(accumulatedCode);
            setStreamStatus("streaming");
          } else if (data.type === "done" && data.code) {
            finalCode = data.code;
          } else if (data.type === "error") {
            streamError = data.error ?? "Unknown stream error";
          }
        });

        /* Handle stream-level errors */
        if (streamError) {
          setStreamingCode(null);
          const assistantMsg: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `Error: ${streamError}`,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          conversationRef.current.push({
            role: "assistant",
            content: "I was unable to generate valid code for that request.",
          });
          return;
        }

        if (!finalCode) {
          finalCode = accumulatedCode;
        }

        /* Check for vision "Unable to identify" response */
        if (hasImage && finalCode && finalCode.includes("Unable to identify")) {
          setStreamingCode(null);
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

        /* Validate in sandbox */
        setStreamStatus("validating");
        const result = runJscad(finalCode);

        if (result.ok) {
          onCodeGenerated?.(finalCode);

          if (attempt > 1) {
            console.log(`[ChatPanel] Attempt ${attempt}/${MAX_ATTEMPTS} succeeded after retry`);
          }

          setStreamingCode(null);

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
          conversationRef.current.push({ role: "assistant", content: finalCode });
          return;
        }

        /* Sandbox error — prepare for retry */
        lastError = result.error;
        lastFailedCode = finalCode;
        console.warn(
          `[ChatPanel] Attempt ${attempt}/${MAX_ATTEMPTS} failed sandbox validation: ${result.error}`,
        );
      }

      /* All attempts exhausted */
      setStreamingCode(null);
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
      conversationRef.current.push({
        role: "assistant",
        content: "I was unable to generate valid code for that request.",
      });
    } catch {
      setStreamingCode(null);
      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Error: Failed to reach the server. Is the dev server running?",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      conversationRef.current.push({
        role: "assistant",
        content: "I was unable to generate valid code for that request.",
      });
    } finally {
      setStreamingCode(null);
      setIsGenerating(false);
      onGeneratingChange?.(false);
      sendingRef.current = false;
    }
  }, [currentCode, onCodeGenerated, onGeneratingChange, onPromptSent]);

  const hasMessages = messages.length > 0;
  const showSnippet = isGenerating && streamingCode !== null;

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
        {!hasMessages && !showSnippet ? (
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
            {/* Show streaming code snippet while generating */}
            {showSnippet && (
              <CodeStreamSnippet
                code={streamingCode}
                status={streamStatus}
                attempt={streamAttempt}
              />
            )}
          </div>
        )}
      </div>

      {/* ---- Input bar pinned at bottom ---- */}
      <InputBar onSend={handleSend} disabled={isGenerating} />
    </div>
  );
}

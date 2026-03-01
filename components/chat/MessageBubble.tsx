/**
 * MessageBubble -- Renders a single chat message with optional image thumbnail.
 *
 * Two visual variants controlled by `role`:
 *   - "user"      : right-aligned, violet-500 background, white text
 *   - "assistant" : left-aligned, gray-100 background, gray-800 text
 *
 * Props:
 *   role         -- who sent the message
 *   content      -- the plain-text message body
 *   imageDataUrl -- optional image thumbnail (shown above text in user bubbles)
 */

import { memo } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
}

export default memo(function MessageBubble({ role, content, imageDataUrl }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
    >
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${
            isUser
              ? /* User bubble: violet accent, white text */
                "bg-violet-500 text-white shadow-sm"
              : /* Assistant bubble: light surface, dark text */
                "bg-gray-100 text-gray-700"
          }
        `}
      >
        {/* Image thumbnail above text */}
        {imageDataUrl && isUser && (
          <img
            src={imageDataUrl}
            alt="Attached"
            className="mb-2 max-w-[200px] max-h-[150px] rounded-lg object-cover"
          />
        )}
        {/* Preserve line breaks in messages */}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
});

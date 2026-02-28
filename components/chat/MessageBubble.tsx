/**
 * MessageBubble -- Renders a single chat message.
 *
 * Two visual variants controlled by `role`:
 *   - "user"      : right-aligned, violet-500 background, white text
 *   - "assistant" : left-aligned, gray-100 background, gray-800 text
 *
 * Props:
 *   role    -- who sent the message
 *   content -- the plain-text message body
 */

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-1`}
    >
      <div
        className={`
          max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed
          ${
            isUser
              ? /* User bubble: violet accent, white text */
                "bg-violet-500 text-white"
              : /* Assistant bubble: light surface, dark text */
                "bg-gray-100 text-gray-800"
          }
        `}
      >
        {/* Preserve line breaks in messages */}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

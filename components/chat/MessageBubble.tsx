/**
 * MessageBubble -- Renders a single chat message.
 *
 * Two visual variants controlled by `role`:
 *   - "user"      : right-aligned, emerald accent background
 *   - "assistant" : left-aligned, darker zinc background
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
              ? /* User bubble: emerald accent, white text */
                "bg-emerald-600 text-white"
              : /* Assistant bubble: subtle dark surface */
                "bg-zinc-800 text-zinc-200"
          }
        `}
      >
        {/* Preserve line breaks in messages */}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

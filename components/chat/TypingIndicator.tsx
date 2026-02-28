/**
 * TypingIndicator -- Three pulsing dots shown while the AI generates a response.
 *
 * Theme: Light -- gray-100 background, violet-400/gray-400 dots.
 * Displayed in place of a MessageBubble on the assistant side.
 * The dots use staggered CSS animations for a gentle pulse effect.
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-1">
      <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3">
        {/* Three dots with staggered animation delays */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * TypingIndicator -- Three pulsing dots shown while the AI generates a response.
 *
 * Displayed in place of a MessageBubble on the assistant side.
 * The dots use staggered CSS animations for a gentle bounce effect.
 *
 * The keyframe animation is defined inline via Tailwind's arbitrary
 * animation utilities to avoid touching globals.css.
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 py-1">
      <div className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-4 py-3">
        {/* Three dots with staggered animation delays */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-zinc-500 animate-bounce"
            style={{
              /* Stagger each dot by 150 ms */
              animationDelay: `${i * 150}ms`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

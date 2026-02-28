/**
 * QuickPromptChips -- Grid of example prompt pills for empty-state onboarding.
 *
 * Shown beneath the welcome message when there are no messages yet.
 * Each chip fires the `onSelect` callback with its prompt text.
 * For now, if no callback is provided the prompt is logged to the console.
 *
 * Props:
 *   onSelect -- optional callback fired when a chip is clicked
 */

const PROMPTS = [
  "Simple box with lid",
  "Phone stand",
  "Gear with 12 teeth",
  "Cable organizer",
  "Hex nut M8",
  "Vase with spiral pattern",
] as const;

interface QuickPromptChipsProps {
  onSelect?: (prompt: string) => void;
}

export default function QuickPromptChips({ onSelect }: QuickPromptChipsProps) {
  const handleClick = (prompt: string) => {
    if (onSelect) {
      onSelect(prompt);
    } else {
      console.log("[QuickPromptChips] selected:", prompt);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 px-6">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => handleClick(prompt)}
          className="
            rounded-full border border-zinc-700 bg-zinc-900
            px-3.5 py-1.5 text-xs text-zinc-400
            transition-all duration-150
            hover:border-emerald-600 hover:text-emerald-400
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
            active:scale-95
          "
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

"use client";

/**
 * QuickPromptChips -- Grid of example prompt pills for empty-state onboarding.
 *
 * Theme: Light -- white background, gray-200 borders, violet hover accents.
 * Shown beneath the welcome message when there are no messages yet.
 * Each chip fires the `onSelect` callback with its prompt text.
 *
 * Props:
 *   onSelect -- optional callback fired when a chip is clicked
 */

import { memo } from "react";

const PROMPTS = [
  "Simple box with lid",
  "Phone stand",
  "Pipe flange with bolt holes",
  "Shelf bracket",
  "Bearing block",
  "Dice",
] as const;

interface QuickPromptChipsProps {
  onSelect?: (prompt: string) => void;
}

export default memo(function QuickPromptChips({ onSelect }: QuickPromptChipsProps) {
  const handleClick = (prompt: string) => {
    if (onSelect) {
      onSelect(prompt);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 px-6">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => handleClick(prompt)}
          className="
            rounded-full border border-gray-200 bg-white
            px-3.5 py-1.5 text-xs text-gray-500
            transition-all duration-150
            hover:border-violet-500 hover:text-violet-600
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
            active:scale-95
          "
        >
          {prompt}
        </button>
      ))}
    </div>
  );
});

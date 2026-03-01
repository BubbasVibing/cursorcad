import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/prompts/system";
import type { ConversationMessage } from "@/lib/types";

/** Remove markdown fences if Claude accidentally wraps output */
export function stripFences(text: string): string {
  return text.replace(/^```(?:\w*)\n?/, "").replace(/\n?```$/, "").trim();
}

export async function generateCode(
  messages: ConversationMessage[],
  currentCode?: string | null,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    throw new Error("MISSING_API_KEY");
  }

  let systemPrompt = SYSTEM_PROMPT;

  if (currentCode) {
    systemPrompt += `

## Current model code

The user has an existing model. Here is the current JSCAD code:

\`\`\`
${currentCode}
\`\`\`

When the user asks for modifications, edit this code. Preserve existing structure, only change what's requested. Return the complete updated code.`;
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in response");
  }

  const code = stripFences(textBlock.text);
  if (!code) {
    throw new Error("Empty code returned");
  }

  return code;
}

/** Build the full system prompt, optionally appending current model code for edits. */
function buildSystemPrompt(currentCode?: string | null): string {
  let systemPrompt = SYSTEM_PROMPT;

  if (currentCode) {
    systemPrompt += `

## Current model code

The user has an existing model. Here is the current JSCAD code:

\`\`\`
${currentCode}
\`\`\`

When the user asks for modifications, edit this code. Preserve existing structure, only change what's requested. Return the complete updated code.`;
  }

  return systemPrompt;
}

/**
 * Stream-based variant of generateCode.
 * Returns the Anthropic MessageStream so the caller can attach event listeners.
 */
export function generateCodeStream(
  messages: ConversationMessage[],
  currentCode?: string | null,
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    throw new Error("MISSING_API_KEY");
  }

  const client = new Anthropic({ apiKey });

  return client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: buildSystemPrompt(currentCode),
    messages,
  });
}

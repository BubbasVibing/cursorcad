import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, VISION_PROMPT_SECTION } from "@/prompts/system";
import type { ConversationMessage, ImageAttachment } from "@/lib/types";

/** Remove markdown fences if Claude accidentally wraps output */
export function stripFences(text: string): string {
  return text.replace(/^```(?:\w*)\n?/, "").replace(/\n?```$/, "").trim();
}

/** Build the full system prompt, optionally appending current model code and vision section. */
function buildSystemPrompt(currentCode?: string | null, hasImage?: boolean): string {
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

  if (hasImage) {
    systemPrompt += VISION_PROMPT_SECTION;
  }

  return systemPrompt;
}

/** Build Anthropic API messages, optionally adding an image to the last user message. */
function buildApiMessages(
  messages: ConversationMessage[],
  image?: ImageAttachment | null,
): Anthropic.MessageParam[] {
  return messages.map((msg, i) => {
    if (image && msg.role === "user" && i === messages.length - 1) {
      return {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: image.mediaType,
              data: image.base64,
            },
          },
          { type: "text" as const, text: msg.content },
        ],
      };
    }
    return { role: msg.role, content: msg.content };
  });
}

export async function generateCode(
  messages: ConversationMessage[],
  currentCode?: string | null,
  image?: ImageAttachment | null,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    throw new Error("MISSING_API_KEY");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: image ? 4096 : 2048,
    system: buildSystemPrompt(currentCode, !!image),
    messages: buildApiMessages(messages, image),
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

/**
 * Stream-based variant of generateCode.
 * Returns the Anthropic MessageStream so the caller can attach event listeners.
 */
export function generateCodeStream(
  messages: ConversationMessage[],
  currentCode?: string | null,
  image?: ImageAttachment | null,
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    throw new Error("MISSING_API_KEY");
  }

  const client = new Anthropic({ apiKey });

  return client.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: image ? 4096 : 2048,
    system: buildSystemPrompt(currentCode, !!image),
    messages: buildApiMessages(messages, image),
  });
}

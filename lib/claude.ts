import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, VISION_PROMPT_SECTION } from "@/prompts/system";
import type { ConversationMessage, ImageAttachment } from "@/lib/types";

/** Remove markdown fences if Claude accidentally wraps output */
function stripFences(text: string): string {
  return text.replace(/^```(?:\w*)\n?/, "").replace(/\n?```$/, "").trim();
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

  if (image) {
    systemPrompt += VISION_PROMPT_SECTION;
  }

  const client = new Anthropic({ apiKey });

  /* Build messages, transforming the last user message to include image if present */
  const apiMessages: Anthropic.MessageParam[] = messages.map((msg, i) => {
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

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: image ? 4096 : 2048,
    system: systemPrompt,
    messages: apiMessages,
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

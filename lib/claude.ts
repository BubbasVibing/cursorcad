import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/prompts/system";

/** Remove markdown fences if Claude accidentally wraps output */
function stripFences(text: string): string {
  return text.replace(/^```(?:\w*)\n?/, "").replace(/\n?```$/, "").trim();
}

export async function generateCode(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    throw new Error("MISSING_API_KEY");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
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

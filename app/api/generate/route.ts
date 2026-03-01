import { NextRequest, NextResponse } from "next/server";
import { generateCodeStream, stripFences } from "@/lib/claude";
import { expandPrompt } from "@/lib/prompt-expander";
import type { ConversationMessage, ImageAttachment } from "@/lib/types";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BASE64_LENGTH = 20 * 1024 * 1024; // ~20MB string length

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  let { messages, currentCode, imageBase64, imageMediaType } = body as {
    messages: ConversationMessage[];
    currentCode?: string | null;
    imageBase64?: string;
    imageMediaType?: string;
  };

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages[messages.length - 1].role !== "user"
  ) {
    return NextResponse.json(
      { error: "messages must be a non-empty array ending with a user message" },
      { status: 400 },
    );
  }

  /* Build image attachment if provided */
  let image: ImageAttachment | null = null;
  if (imageBase64) {
    if (!imageMediaType || !ALLOWED_MEDIA_TYPES.includes(imageMediaType)) {
      return NextResponse.json(
        { error: "Invalid image type. Supported: JPEG, PNG, WebP." },
        { status: 400 },
      );
    }
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "Image is too large. Please use a smaller image." },
        { status: 400 },
      );
    }
    image = {
      base64: imageBase64,
      mediaType: imageMediaType as ImageAttachment["mediaType"],
    };
  }

  try {
    // Expand the last user message through the prompt expander pipeline
    const lastMessage = messages[messages.length - 1];
    const expanded = expandPrompt(lastMessage.content);
    if (expanded.wasExpanded) {
      messages = messages.map((msg, i) =>
        i === messages.length - 1 ? { ...msg, content: expanded.text } : msg
      );
      if (process.env.NODE_ENV === 'development') {
        console.log('[prompt-expander] Original:', lastMessage.content);
        console.log('[prompt-expander] Expanded:', expanded.text);
      }
    }

    const stream = generateCodeStream(messages, currentCode, image);

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          stream.on("text", (textDelta: string) => {
            fullText += textDelta;
            const line = JSON.stringify({ type: "delta", text: textDelta }) + "\n";
            controller.enqueue(encoder.encode(line));
          });

          await stream.finalMessage();

          const cleanedCode = stripFences(fullText);
          const doneLine = JSON.stringify({ type: "done", code: cleanedCode }) + "\n";
          controller.enqueue(encoder.encode(doneLine));
          controller.close();
        } catch (err) {
          console.error("[generate] stream error:", err);
          const errorLine = JSON.stringify({
            type: "error",
            error: err instanceof Error ? err.message : "Stream failed",
          }) + "\n";
          controller.enqueue(encoder.encode(errorLine));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[generate] error:", err);

    if (err instanceof Error && err.message === "MISSING_API_KEY") {
      return NextResponse.json(
        { error: "Server is not configured — missing API key" },
        { status: 500 },
      );
    }

    /* Handle Anthropic image-related errors */
    if (err instanceof Error && err.message.includes("image")) {
      return NextResponse.json(
        { error: "Could not process the image. Try a different photo." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate model — please try again" },
      { status: 502 },
    );
  }
}

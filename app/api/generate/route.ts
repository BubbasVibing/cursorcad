import { NextRequest, NextResponse } from "next/server";
import { generateCodeStream, stripFences } from "@/lib/claude";
import type { ConversationMessage } from "@/lib/types";

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

  const { messages, currentCode } = body as {
    messages: ConversationMessage[];
    currentCode?: string | null;
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

  try {
    const stream = generateCodeStream(messages, currentCode);

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

    return NextResponse.json(
      { error: "Failed to generate model — please try again" },
      { status: 502 },
    );
  }
}

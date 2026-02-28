import { NextRequest, NextResponse } from "next/server";
import { generateCode } from "@/lib/claude";
import type { ConversationMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
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
    const code = await generateCode(messages, currentCode);
    return NextResponse.json({ code });
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

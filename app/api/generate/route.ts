import { NextRequest, NextResponse } from "next/server";
import { generateCode } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  console.log("[generate] received prompt:", prompt);

  try {
    const code = await generateCode(prompt.trim());
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

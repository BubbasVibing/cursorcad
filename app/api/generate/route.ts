import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  console.log("[generate] received prompt:", prompt);

  // Hardcoded JSCAD response — will be replaced with Claude call in 2.2
  const code = [
    "const block = cuboid({ size: [4, 4, 4] });",
    "const hole = cylinder({ radius: 1.2, height: 6 });",
    "return subtract(block, hole);",
  ].join("\n");

  return NextResponse.json({ code });
}

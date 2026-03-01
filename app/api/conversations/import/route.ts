import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";
import { getAuthUserId } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { sessions } = await req.json();

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return NextResponse.json(
      { error: "No sessions to import" },
      { status: 400 }
    );
  }

  const docs = sessions.map(
    (s: {
      title?: string;
      messages?: { role: string; content: string }[];
      jscadCode?: string | null;
      lastPrompt?: string | null;
      createdAt?: number;
      updatedAt?: number;
    }) => ({
      userId,
      title: s.title || "Untitled Design",
      messages: (s.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: new Date(s.createdAt || Date.now()),
      })),
      jscadCode: s.jscadCode || null,
      lastPrompt: s.lastPrompt || null,
      createdAt: new Date(s.createdAt || Date.now()),
      updatedAt: new Date(s.updatedAt || Date.now()),
    })
  );

  const result = await Conversation.insertMany(docs);

  return NextResponse.json({ imported: result.length });
}

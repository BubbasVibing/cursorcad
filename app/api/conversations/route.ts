import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";
import { getAuthUserId } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const conversations = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .select("title lastPrompt messages updatedAt createdAt")
    .lean();

  const list = conversations.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    lastPrompt: c.lastPrompt,
    messageCount: c.messages.length,
    lastMessage:
      c.messages.length > 0
        ? c.messages[c.messages.length - 1].content.slice(0, 100)
        : null,
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
  }));

  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json();
  const { title, messages, jscadCode, lastPrompt } = body;

  const conversation = await Conversation.create({
    userId,
    title: title || "Untitled Design",
    messages: messages || [],
    jscadCode: jscadCode || null,
    lastPrompt: lastPrompt || null,
  });

  return NextResponse.json(
    {
      id: conversation._id.toString(),
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    },
    { status: 201 }
  );
}

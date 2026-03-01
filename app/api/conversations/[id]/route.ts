import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";
import { getAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const conversation = await Conversation.findOne({
    _id: id,
    userId,
  }).lean();
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: conversation._id.toString(),
    title: conversation.title,
    messages: conversation.messages,
    jscadCode: conversation.jscadCode,
    lastPrompt: conversation.lastPrompt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await req.json();

  const allowedFields: Record<string, unknown> = {};
  if (body.title !== undefined) allowedFields.title = body.title;
  if (body.messages !== undefined) allowedFields.messages = body.messages;
  if (body.jscadCode !== undefined) allowedFields.jscadCode = body.jscadCode;
  if (body.lastPrompt !== undefined) allowedFields.lastPrompt = body.lastPrompt;

  const updated = await Conversation.findOneAndUpdate(
    { _id: id, userId },
    { $set: allowedFields },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updated._id.toString(),
    title: updated.title,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const result = await Conversation.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

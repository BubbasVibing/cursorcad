import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getClientPromise } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = (name || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    const client = await getClientPromise();
    const usersCollection = client.db().collection("users");

    const existingUser = await usersCollection.findOne({ email: trimmedEmail });

    if (existingUser) {
      if (existingUser.hashedPassword) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }
      // OAuth-only user adding a password — link accounts
      const hashedPassword = await bcrypt.hash(password, 12);
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            hashedPassword,
            ...(trimmedName && !existingUser.name ? { name: trimmedName } : {}),
          },
        },
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // New user — insert matching MongoDBAdapter document format
    const hashedPassword = await bcrypt.hash(password, 12);
    await usersCollection.insertOne({
      name: trimmedName || null,
      email: trimmedEmail,
      emailVerified: null,
      image: null,
      hashedPassword,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}

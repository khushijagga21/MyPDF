import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";

export const runtime = "nodejs";

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured. Set DATABASE_URL in .env" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[auth/register POST]", err);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}

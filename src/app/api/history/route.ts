import { NextResponse } from "next/server";
import { requireSessionUserId } from "@/lib/auth/session";
import { getUserHistory } from "@/lib/db/files";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  try {
    const userId = await requireSessionUserId();
    const history = await getUserHistory(userId);
    return NextResponse.json({ history });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

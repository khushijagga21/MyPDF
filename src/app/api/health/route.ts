import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    database: "skipped",
  };

  if (isDatabaseConfigured()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "error";
      return NextResponse.json(
        { status: "unhealthy", checks },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ status: "healthy", checks });
}

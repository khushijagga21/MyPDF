import { NextResponse } from "next/server";
import { requireSessionUserId } from "@/lib/auth/session";
import {
  getUserFiles,
  getUserHistory,
  parseInputFileIds,
} from "@/lib/db/files";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database is not configured. Copy .env.example to .env and run npm run db:push",
      },
      { status: 503 }
    );
  }

  try {
    const userId = await requireSessionUserId();
    const [files, history] = await Promise.all([
      getUserFiles(userId),
      getUserHistory(userId),
    ]);

    return NextResponse.json({
      uploads: files.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        category: f.category,
        createdAt: f.createdAt.toISOString(),
        downloadUrl: `/api/upload/${f.id}`,
      })),
      processed: history.map((h) => ({
        id: h.id,
        tool: h.tool,
        status: h.status,
        outputFileName: h.outputFileName,
        outputSize: h.outputSize,
        createdAt: h.createdAt.toISOString(),
        sourceFile: h.storedFile,
        outputFile: h.outputStoredFile,
        outputDownloadUrl: h.outputStoredFile
          ? `/api/upload/${h.outputStoredFile.id}`
          : null,
        sourceDownloadUrl: h.storedFile
          ? `/api/upload/${h.storedFile.id}`
          : null,
        inputFileIds: parseInputFileIds(h.inputFileIds),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

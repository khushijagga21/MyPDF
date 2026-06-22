import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { UploadCategory, UploadedFileRecord } from "@/lib/upload/types";
import { CATEGORY_LIMITS } from "@/lib/upload/config";
import { sanitizeFileName, validateFile } from "@/lib/upload/validation";
import { ensureUploadDirs, saveUploadedFile } from "@/lib/upload/storage";
import { getSessionUserId } from "@/lib/auth/session";
import { logFileHistory } from "@/lib/db/files";

export const runtime = "nodejs";

function parseCategory(value: string | null): UploadCategory {
  if (
    value === "image" ||
    value === "any" ||
    value === "excel" ||
    value === "word"
  ) {
    return value;
  }
  return "pdf";
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in required to upload files." },
        { status: 401 }
      );
    }

    await ensureUploadDirs();

    const { searchParams } = new URL(request.url);
    const category = parseCategory(searchParams.get("category"));

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const validation = validateFile(
      { name: file.name, size: file.size, type: file.type },
      category
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0]?.message ?? "Invalid file." },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const safeName = sanitizeFileName(file.name);
    const storedName = `${id}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const sessionUserId = userId;

    const record: UploadedFileRecord = {
      id,
      originalName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      category,
      createdAt: new Date().toISOString(),
      url: `/api/upload/${id}`,
      userId: sessionUserId,
    };

    await saveUploadedFile(id, buffer, record, sessionUserId);

    await logFileHistory({
      userId: sessionUserId,
      tool: "upload",
      inputFileIds: [id],
      storedFileId: id,
      outputFileName: file.name,
      outputSize: file.size,
      status: "completed",
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[upload POST]", err);
    return NextResponse.json(
      { error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    limits: CATEGORY_LIMITS,
    message: "Use POST with multipart/form-data to upload files.",
  });
}

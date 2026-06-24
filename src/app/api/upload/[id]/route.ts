import { NextResponse } from "next/server";
import {
  deleteUploadedFile,
  readUploadedFileBuffer,
} from "@/lib/upload/storage";
import { canAccessFile } from "@/lib/db/files";
import { getSessionUserId } from "@/lib/auth/session";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = await getSessionUserId();

    if (!(await canAccessFile(id, userId))) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const result = await readUploadedFileBuffer(id);

    if (!result) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const { meta, buffer } = result;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": meta.mimeType,
        "Content-Length": String(meta.size),
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.originalName)}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("[upload GET]", err);
    return NextResponse.json(
      { error: "Failed to read file." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = await getSessionUserId();

    if (!(await canAccessFile(id, userId))) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const deleted = await deleteUploadedFile(id);

    if (!deleted) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[upload DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
}

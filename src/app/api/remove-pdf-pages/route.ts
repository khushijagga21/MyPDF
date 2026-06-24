import { NextResponse } from "next/server";
import { removePdfPages } from "@/lib/pdf/remove-pages";
import type { RemovePdfPagesRequest } from "@/lib/pdf/types";
import { PdfUploadError } from "@/lib/api/parse-pdf-upload";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";
export const maxDuration = 60;

async function resolveRemoveInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      throw new PdfUploadError("Invalid request.", 400);
    }

    const body = JSON.parse(payloadRaw) as Omit<RemovePdfPagesRequest, "fileId">;
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new PdfUploadError("No PDF file provided.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const baseName =
      body.baseName?.replace(/\.pdf$/i, "") ||
      (file.name || "document").replace(/\.pdf$/i, "");

    return { body, bytes, baseName, fileId: undefined as string | undefined };
  }

  const body = (await request.json()) as RemovePdfPagesRequest;
  if (!body?.fileId || !Array.isArray(body.removePages)) {
    throw new PdfUploadError("Invalid request.", 400);
  }

  const result = await readUploadedFileBuffer(body.fileId);
  if (!result) {
    throw new PdfUploadError("Uploaded file not found. Please upload again.", 404);
  }

  const baseName =
    body.baseName?.replace(/\.pdf$/i, "") ||
    result.meta.originalName.replace(/\.pdf$/i, "");

  return {
    body,
    bytes: new Uint8Array(result.buffer),
    baseName,
    fileId: body.fileId,
  };
}

export async function POST(request: Request) {
  try {
    const { body, bytes, baseName, fileId } = await resolveRemoveInput(request);

    const pdfBytes = await removePdfPages(
      bytes,
      body.removePages.map(Number).filter((n) => Number.isFinite(n))
    );

    await logToolJob({
      tool: "remove-pdf-pages",
      inputFileIds: fileId ? [fileId] : [],
      storedFileId: fileId ?? null,
      outputFileName: `${baseName}-edited.pdf`,
      outputSize: pdfBytes.length,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-edited.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof PdfUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[remove-pdf-pages POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to remove PDF pages.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

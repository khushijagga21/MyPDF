import { NextResponse } from "next/server";
import { editPdfPages } from "@/lib/pdf/edit";
import type { EditPdfRequest } from "@/lib/pdf/types";
import { PdfUploadError } from "@/lib/api/parse-pdf-upload";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { saveToolArtifacts } from "@/lib/db/save-tool-artifacts";

export const runtime = "nodejs";
export const maxDuration = 60;

async function resolveEditInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      throw new PdfUploadError("Invalid edit request.", 400);
    }

    const body = JSON.parse(payloadRaw) as Omit<EditPdfRequest, "fileId">;
    if (!Array.isArray(body.pages) || body.pages.length === 0) {
      throw new PdfUploadError("Invalid edit request.", 400);
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new PdfUploadError("No PDF file provided.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const baseName =
      body.baseName?.replace(/\.pdf$/i, "") ||
      (file.name || "document").replace(/\.pdf$/i, "");

    return { body, bytes, baseName, fileId: undefined as string | undefined, inputName: file.name || "document.pdf" };
  }

  const body = (await request.json()) as EditPdfRequest;
  if (!body?.fileId || !Array.isArray(body.pages) || body.pages.length === 0) {
    throw new PdfUploadError("Invalid edit request.", 400);
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
    inputName: result.meta.originalName,
  };
}

export async function POST(request: Request) {
  try {
    const { body, bytes, baseName, fileId, inputName } = await resolveEditInput(request);

    const pages = body.pages.map((p) => ({
      pageIndex: Number(p.pageIndex),
      rotation: Number(p.rotation) || 0,
    }));

    const pdfBytes = await editPdfPages(bytes, pages);
    const outputFileName = `${baseName}-edited.pdf`;

    await saveToolArtifacts({
      tool: "edit-pdf",
      input: fileId
        ? undefined
        : {
            buffer: Buffer.from(bytes),
            fileName: inputName,
            mimeType: "application/pdf",
          },
      inputFileIds: fileId ? [fileId] : undefined,
      output: {
        buffer: Buffer.from(pdfBytes),
        fileName: outputFileName,
        mimeType: "application/pdf",
      },
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof PdfUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[edit-pdf POST]", err);
    const message = err instanceof Error ? err.message : "Failed to edit PDF.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

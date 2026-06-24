import { NextResponse } from "next/server";
import { mergePdfBuffers, mergePdfPagesOrdered } from "@/lib/pdf/merge";
import type { MergePdfRequest } from "@/lib/pdf/types";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";
export const maxDuration = 60;

async function loadPdfBuffer(fileId: string): Promise<Uint8Array> {
  const result = await readUploadedFileBuffer(fileId);
  if (!result) {
    throw new Error(`Uploaded file not found: ${fileId}`);
  }
  if (result.meta.category !== "pdf" && result.meta.mimeType !== "application/pdf") {
    throw new Error(`"${result.meta.originalName}" is not a PDF file.`);
  }
  return new Uint8Array(result.buffer);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MergePdfRequest;

    if (!body || !body.mode) {
      return NextResponse.json({ error: "Invalid merge request." }, { status: 400 });
    }

    let mergedBytes: Uint8Array;

    if (body.mode === "files") {
      const fileIds = body.fileIds;
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return NextResponse.json(
          { error: "Provide at least one file ID to merge." },
          { status: 400 }
        );
      }
      if (fileIds.length < 2) {
        return NextResponse.json(
          { error: "Select at least 2 PDF files to merge." },
          { status: 400 }
        );
      }

      const buffers: Uint8Array[] = [];
      for (const id of fileIds) {
        buffers.push(await loadPdfBuffer(id));
      }
      mergedBytes = await mergePdfBuffers(buffers);
    } else if (body.mode === "pages") {
      const pages = body.pages;
      if (!Array.isArray(pages) || pages.length === 0) {
        return NextResponse.json(
          { error: "Provide at least one page to merge." },
          { status: 400 }
        );
      }

      mergedBytes = await mergePdfPagesOrdered(pages, loadPdfBuffer);
    } else {
      return NextResponse.json({ error: "Invalid merge mode." }, { status: 400 });
    }

    const inputIds =
      body.mode === "files"
        ? body.fileIds
        : [...new Set(body.pages.map((p) => p.fileId))];

    await logToolJob({
      tool: "merge-pdf",
      inputFileIds: inputIds,
      outputFileName: "merged-document.pdf",
      outputSize: mergedBytes.length,
    });

    return new NextResponse(Buffer.from(mergedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged-document.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[merge-pdf POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to merge PDF files.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

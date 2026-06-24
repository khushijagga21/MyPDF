import { NextResponse } from "next/server";
import { removePdfPages } from "@/lib/pdf/remove-pages";
import type { RemovePdfPagesRequest } from "@/lib/pdf/types";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RemovePdfPagesRequest;

    if (!body?.fileId || !Array.isArray(body.removePages)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const result = await readUploadedFileBuffer(body.fileId);
    if (!result) {
      return NextResponse.json(
        { error: "Uploaded file not found. Please upload again." },
        { status: 404 }
      );
    }

    if (result.meta.category !== "pdf" && result.meta.mimeType !== "application/pdf") {
      return NextResponse.json(
        { error: `"${result.meta.originalName}" is not a PDF file.` },
        { status: 400 }
      );
    }

    const baseName =
      body.baseName?.replace(/\.pdf$/i, "") ||
      result.meta.originalName.replace(/\.pdf$/i, "");

    const pdfBytes = await removePdfPages(
      new Uint8Array(result.buffer),
      body.removePages.map(Number).filter((n) => Number.isFinite(n))
    );

    await logToolJob({
      tool: "remove-pdf-pages",
      inputFileIds: [body.fileId],
      storedFileId: body.fileId,
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
    console.error("[remove-pdf-pages POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to remove PDF pages.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

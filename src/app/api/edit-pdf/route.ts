import { NextResponse } from "next/server";
import { editPdfPages } from "@/lib/pdf/edit";
import type { EditPdfRequest } from "@/lib/pdf/types";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EditPdfRequest;

    if (!body?.fileId || !Array.isArray(body.pages) || body.pages.length === 0) {
      return NextResponse.json({ error: "Invalid edit request." }, { status: 400 });
    }

    const result = await readUploadedFileBuffer(body.fileId);
    if (!result) {
      return NextResponse.json(
        { error: "Uploaded file not found. Please upload again." },
        { status: 404 }
      );
    }

    const baseName =
      body.baseName?.replace(/\.pdf$/i, "") ||
      result.meta.originalName.replace(/\.pdf$/i, "");

    const pages = body.pages.map((p) => ({
      pageIndex: Number(p.pageIndex),
      rotation: Number(p.rotation) || 0,
    }));

    const pdfBytes = await editPdfPages(new Uint8Array(result.buffer), pages);

    await logToolJob({
      tool: "edit-pdf",
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
    console.error("[edit-pdf POST]", err);
    const message = err instanceof Error ? err.message : "Failed to edit PDF.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

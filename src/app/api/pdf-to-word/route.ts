import { NextResponse } from "next/server";
import { pdfToWordFromBuffer } from "@/lib/word/pdf-to-word";
import { parsePdfFromRequest, PdfUploadError } from "@/lib/api/parse-pdf-upload";
import { saveToolArtifacts } from "@/lib/db/save-tool-artifacts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { buffer, originalName, fileId } = await parsePdfFromRequest(request);
    const blob = await pdfToWordFromBuffer(buffer);
    const arrayBuffer = await blob.arrayBuffer();
    const baseName = originalName.replace(/\.pdf$/i, "") || "document";
    const fileName = `${baseName}.docx`;

    await saveToolArtifacts({
      tool: "pdf-to-word",
      input: fileId
        ? undefined
        : { buffer, fileName: originalName, mimeType: "application/pdf" },
      inputFileIds: fileId ? [fileId] : undefined,
      output: {
        buffer: Buffer.from(arrayBuffer),
        fileName,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof PdfUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[pdf-to-word POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to convert PDF to Word.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

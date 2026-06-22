import { NextResponse } from "next/server";
import {
  extractPageRange,
  packPdfsToZip,
  splitEveryNPages,
  splitIndividualPages,
} from "@/lib/pdf/split";
import type { SplitPdfRequest } from "@/lib/pdf/types";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";

async function loadPdfFile(fileId: string) {
  const result = await readUploadedFileBuffer(fileId);
  if (!result) {
    throw new Error("Uploaded file not found. Please upload again.");
  }
  if (result.meta.category !== "pdf" && result.meta.mimeType !== "application/pdf") {
    throw new Error(`"${result.meta.originalName}" is not a PDF file.`);
  }
  const baseName = result.meta.originalName.replace(/\.pdf$/i, "");
  return {
    bytes: new Uint8Array(result.buffer),
    baseName,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SplitPdfRequest;

    if (!body?.mode || !body.fileId) {
      return NextResponse.json({ error: "Invalid split request." }, { status: 400 });
    }

    const { bytes, baseName: defaultBaseName } = await loadPdfFile(body.fileId);
    const baseName = body.baseName?.replace(/\.pdf$/i, "") || defaultBaseName;

    if (body.mode === "range") {
      const from = Number(body.from);
      const to = Number(body.to);

      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return NextResponse.json(
          { error: "Provide valid start and end page numbers." },
          { status: 400 }
        );
      }

      const pdfBytes = await extractPageRange(bytes, from, to);

      await logToolJob({
        tool: "split-pdf",
        inputFileIds: [body.fileId],
        outputFileName: `${baseName}-pages-${from}-${to}.pdf`,
        outputSize: pdfBytes.length,
      });

      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${baseName}-pages-${from}-${to}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (body.mode === "every") {
      const every = Number(body.every);
      if (!Number.isFinite(every) || every < 1) {
        return NextResponse.json(
          { error: "Pages per file must be at least 1." },
          { status: 400 }
        );
      }

      const parts = await splitEveryNPages(bytes, every, baseName);
      const zipBytes = await packPdfsToZip(parts);

      await logToolJob({
        tool: "split-pdf",
        inputFileIds: [body.fileId],
        outputFileName: `${baseName}-split.zip`,
        outputSize: zipBytes.length,
      });

      return new NextResponse(Buffer.from(zipBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${baseName}-split.zip"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (body.mode === "individual") {
      const pages =
        body.pages && body.pages.length > 0
          ? body.pages.map(Number).filter((n) => Number.isFinite(n))
          : undefined;

      const parts = await splitIndividualPages(bytes, baseName, pages);
      const zipBytes = await packPdfsToZip(parts);

      await logToolJob({
        tool: "split-pdf",
        inputFileIds: [body.fileId],
        outputFileName: `${baseName}-pages.zip`,
        outputSize: zipBytes.length,
      });

      return new NextResponse(Buffer.from(zipBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${baseName}-pages.zip"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ error: "Invalid split mode." }, { status: 400 });
  } catch (err) {
    console.error("[split-pdf POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to split PDF.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

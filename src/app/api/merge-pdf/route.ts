import { NextResponse } from "next/server";
import { mergePdfBuffers, mergePdfPagesOrdered } from "@/lib/pdf/merge";
import type { MergePdfRequest } from "@/lib/pdf/types";
import {
  PdfUploadError,
  readPdfFilesFromFormData,
} from "@/lib/api/parse-pdf-upload";
import { readUploadedFileBuffer } from "@/lib/upload/storage";
import { saveToolArtifacts } from "@/lib/db/save-tool-artifacts";

export const runtime = "nodejs";
export const maxDuration = 60;

interface LocalMergeInput {
  kind: "local-files";
  files: File[];
}

interface LocalMergePagesInput {
  kind: "local-pages";
  files: File[];
  pages: Array<{ fileIndex: number; pageIndex: number }>;
}

interface ServerMergeInput {
  kind: "server";
  body: MergePdfRequest;
}

type ResolvedMergeInput = LocalMergeInput | LocalMergePagesInput | ServerMergeInput;

async function loadPdfBuffer(fileId: string): Promise<Uint8Array> {
  const result = await readUploadedFileBuffer(fileId);
  if (!result) {
    throw new Error(`Uploaded file not found: ${fileId}`);
  }
  if (
    result.meta.category !== "pdf" &&
    result.meta.mimeType !== "application/pdf"
  ) {
    throw new Error(`"${result.meta.originalName}" is not a PDF file.`);
  }
  return new Uint8Array(result.buffer);
}

async function resolveMergeInput(request: Request): Promise<ResolvedMergeInput> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const mode = formData.get("mode");
    const files = readPdfFilesFromFormData(formData);

    if (mode === "files") {
      if (files.length < 2) {
        throw new PdfUploadError("Select at least 2 PDF files to merge.", 400);
      }
      return { kind: "local-files", files };
    }

    if (mode === "pages") {
      const payloadRaw = formData.get("payload");
      if (typeof payloadRaw !== "string") {
        throw new PdfUploadError("Invalid merge request.", 400);
      }
      const payload = JSON.parse(payloadRaw) as {
        pages: Array<{ fileIndex: number; pageIndex: number }>;
      };
      if (!Array.isArray(payload.pages) || payload.pages.length === 0) {
        throw new PdfUploadError("Provide at least one page to merge.", 400);
      }
      if (files.length === 0) {
        throw new PdfUploadError("No PDF files provided.", 400);
      }
      return { kind: "local-pages", files, pages: payload.pages };
    }

    throw new PdfUploadError("Invalid merge mode.", 400);
  }

  const body = (await request.json()) as MergePdfRequest;
  if (!body || !body.mode) {
    throw new PdfUploadError("Invalid merge request.", 400);
  }
  return { kind: "server", body };
}

export async function POST(request: Request) {
  try {
    const resolved = await resolveMergeInput(request);
    let mergedBytes: Uint8Array;
    let inputIds: string[] = [];

    if (resolved.kind === "local-files") {
      const buffers: Uint8Array[] = [];
      for (const file of resolved.files) {
        buffers.push(new Uint8Array(await file.arrayBuffer()));
      }
      mergedBytes = await mergePdfBuffers(buffers);
    } else if (resolved.kind === "local-pages") {
      const buffers: Uint8Array[] = [];
      for (const file of resolved.files) {
        buffers.push(new Uint8Array(await file.arrayBuffer()));
      }

      mergedBytes = await mergePdfPagesOrdered(
        resolved.pages.map((page) => ({
          fileId: String(page.fileIndex),
          pageIndex: page.pageIndex,
        })),
        async (fileId) => {
          const index = Number(fileId);
          const bytes = buffers[index];
          if (!bytes) {
            throw new Error(`File index ${fileId} not found.`);
          }
          return bytes;
        }
      );
    } else {
      const body = resolved.body;

      if (body.mode === "files") {
        const fileIds = body.fileIds;
        if (!Array.isArray(fileIds) || fileIds.length < 2) {
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
        inputIds = fileIds;
      } else if (body.mode === "pages") {
        const pages = body.pages;
        if (!Array.isArray(pages) || pages.length === 0) {
          return NextResponse.json(
            { error: "Provide at least one page to merge." },
            { status: 400 }
          );
        }

        mergedBytes = await mergePdfPagesOrdered(pages, loadPdfBuffer);
        inputIds = [...new Set(pages.map((p) => p.fileId))];
      } else {
        return NextResponse.json({ error: "Invalid merge mode." }, { status: 400 });
      }
    }

    const outputFileName = "merged-document.pdf";
    const outputBuffer = Buffer.from(mergedBytes);

    let localInputs:
      | Array<{ buffer: Buffer; fileName: string; mimeType: string }>
      | undefined;

    if (resolved.kind === "local-files" || resolved.kind === "local-pages") {
      localInputs = await Promise.all(
        resolved.files.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          fileName: file.name,
          mimeType: file.type || "application/pdf",
        }))
      );
    }

    await saveToolArtifacts({
      tool: "merge-pdf",
      inputs: localInputs,
      inputFileIds: inputIds.length > 0 ? inputIds : undefined,
      output: {
        buffer: outputBuffer,
        fileName: outputFileName,
        mimeType: "application/pdf",
      },
    });

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged-document.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof PdfUploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[merge-pdf POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to merge PDF files.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

import { readUploadedFileBuffer } from "@/lib/upload/storage";

export class PdfUploadError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "PdfUploadError";
  }
}

export interface ParsedPdfUpload {
  buffer: Buffer;
  originalName: string;
  fileId?: string;
}

export interface LoadedPdfBytes {
  bytes: Uint8Array;
  originalName: string;
  fileId?: string;
}

export async function parsePdfFromRequest(
  request: Request
): Promise<ParsedPdfUpload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new PdfUploadError("No PDF file provided.", 400);
    }

    if (file.type && file.type !== "application/pdf") {
      throw new PdfUploadError("File must be a PDF.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      throw new PdfUploadError("The uploaded file is empty.", 400);
    }

    return { buffer, originalName: file.name || "document.pdf" };
  }

  const body = (await request.json()) as { fileId?: string };
  const fileId = body.fileId?.trim();

  if (!fileId) {
    throw new PdfUploadError("fileId or file is required.", 400);
  }

  const uploaded = await readUploadedFileBuffer(fileId);
  if (!uploaded) {
    throw new PdfUploadError("Uploaded file not found.", 404);
  }

  if (
    uploaded.meta.category !== "pdf" &&
    uploaded.meta.mimeType !== "application/pdf"
  ) {
    throw new PdfUploadError(
      `"${uploaded.meta.originalName}" is not a PDF file.`,
      400
    );
  }

  return {
    buffer: uploaded.buffer,
    originalName: uploaded.meta.originalName,
    fileId,
  };
}

export async function loadPdfBytesFromMultipart(
  request: Request
): Promise<LoadedPdfBytes> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    throw new PdfUploadError("No PDF file provided.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    throw new PdfUploadError("The uploaded file is empty.", 400);
  }

  return {
    bytes: new Uint8Array(buffer),
    originalName: file.name || "document.pdf",
  };
}

export async function loadPdfBytesFromRequest(
  request: Request
): Promise<LoadedPdfBytes> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return loadPdfBytesFromMultipart(request);
  }

  const parsed = await parsePdfFromRequest(request);
  return {
    bytes: new Uint8Array(parsed.buffer),
    originalName: parsed.originalName,
    fileId: parsed.fileId,
  };
}

export function readPdfFilesFromFormData(formData: FormData): File[] {
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length > 0) return files;

  const single = formData.get("file");
  if (single instanceof File) return [single];

  return [];
}

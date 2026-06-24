"use client";

import { loadPdfJsClient } from "@/lib/pdf/pdfjs-client";

async function toArrayBuffer(
  source: File | ArrayBuffer | Uint8Array
): Promise<ArrayBuffer> {
  if (source instanceof File) return source.arrayBuffer();
  if (source instanceof ArrayBuffer) return source;
  return source.buffer.slice(
    source.byteOffset,
    source.byteOffset + source.byteLength
  ) as ArrayBuffer;
}

/** Render each PDF page to a JPEG data URL for preview thumbnails */
export async function renderPdfThumbnails(
  source: File | ArrayBuffer | Uint8Array,
  options?: { scale?: number; maxPages?: number }
): Promise<string[]> {
  const pdfjs = await loadPdfJsClient();
  const data = new Uint8Array(await toArrayBuffer(source));
  const pdf = await pdfjs.getDocument({ data }).promise;

  const scale = options?.scale ?? 0.28;
  const limit = options?.maxPages ?? pdf.numPages;
  const pageCount = Math.min(pdf.numPages, limit);
  const thumbnails: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext("2d");

    if (!context) {
      thumbnails.push("");
      continue;
    }

    await page.render({ canvas, canvasContext: context, viewport }).promise;
    thumbnails.push(canvas.toDataURL("image/jpeg", 0.72));
  }

  await pdf.cleanup();
  return thumbnails;
}

/** Render thumbnails in batches so the UI stays responsive on large PDFs */
export async function renderPdfThumbnailsProgressive(
  source: File | ArrayBuffer | Uint8Array,
  options: {
    scale?: number;
    batchSize?: number;
    onBatch: (thumbnails: string[], startIndex: number) => void;
  }
): Promise<number> {
  const pdfjs = await loadPdfJsClient();
  const data = new Uint8Array(await toArrayBuffer(source));
  const pdf = await pdfjs.getDocument({ data }).promise;
  const scale = options.scale ?? 0.28;
  const batchSize = options.batchSize ?? 6;

  for (let start = 1; start <= pdf.numPages; start += batchSize) {
    const end = Math.min(start + batchSize - 1, pdf.numPages);
    const batch: string[] = [];

    for (let i = start; i <= end; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext("2d");

      if (!context) {
        batch.push("");
        continue;
      }

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      batch.push(canvas.toDataURL("image/jpeg", 0.72));
    }

    options.onBatch(batch, start - 1);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  const total = pdf.numPages;
  await pdf.cleanup();
  return total;
}

export async function renderPdfThumbnail(
  source: File | ArrayBuffer | Uint8Array,
  pageNumber: number,
  scale = 0.35
): Promise<string> {
  const thumbs = await renderPdfThumbnails(source, {
    scale,
    maxPages: pageNumber,
  });
  return thumbs[pageNumber - 1] ?? "";
}

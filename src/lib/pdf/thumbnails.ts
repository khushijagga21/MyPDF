"use client";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

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
  const pdfjs = await getPdfJs();
  const data = await toArrayBuffer(source);
  const pdf = await pdfjs.getDocument({ data }).promise;

  const scale = options?.scale ?? 0.35;
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
    thumbnails.push(canvas.toDataURL("image/jpeg", 0.82));
  }

  await pdf.cleanup();
  return thumbnails;
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

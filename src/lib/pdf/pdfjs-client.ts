"use client";

/** Client-side PDF.js loader (legacy build — stable with Next.js / webpack). */
export async function loadPdfJsClient() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
  return pdfjs;
}

/** Server-side PDF.js loader (Node.js — no browser worker). */
export async function loadPdfJsServer() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjs;
}

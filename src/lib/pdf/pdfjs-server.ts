import { ensurePdfDomPolyfills } from "@/lib/pdf/dom-polyfills";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfJsPromise: Promise<PdfJsModule> | null = null;

/** Server-side PDF.js loader (Node.js — no browser worker). */
export async function loadPdfJsServer(): Promise<PdfJsModule> {
  await ensurePdfDomPolyfills();

  if (!pdfJsPromise) {
    pdfJsPromise = (async () => {
      // pdf.worker.mjs sets globalThis.pdfjsWorker.WorkerMessageHandler.
      // That lets PDF.js skip dynamic import("./pdf.worker.mjs"), which breaks
      // on Vercel when bundled into .next/server/chunks/.
      await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      return import("pdfjs-dist/legacy/build/pdf.mjs");
    })();
  }

  return pdfJsPromise;
}

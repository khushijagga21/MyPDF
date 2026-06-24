import { ensurePdfDomPolyfills } from "@/lib/pdf/dom-polyfills";
import { createRequire } from "module";
import { pathToFileURL } from "url";

/** Server-side PDF.js loader (Node.js — no browser worker). */
export async function loadPdfJsServer() {
  await ensurePdfDomPolyfills();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Ensure the worker entry resolves from node_modules at runtime (Vercel-safe).
  // Otherwise PDF.js tries to import a bundled chunk path that may not exist.
  try {
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      const require = createRequire(import.meta.url);
      const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
    }
  } catch {
    // ignore; text-extract uses workerless fallback flags too
  }

  return pdfjs;
}

import { ensurePdfDomPolyfills } from "@/lib/pdf/dom-polyfills";
import { createRequire } from "module";
import { pathToFileURL } from "url";

/** Server-side PDF.js loader (Node.js — no browser worker). */
export async function loadPdfJsServer() {
  await ensurePdfDomPolyfills();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // PDF.js defaults workerSrc to "./pdf.worker.mjs" on Node. Bundlers rewrite that
  // to a missing .next/server/chunks path on Vercel — always use node_modules.
  const require = createRequire(import.meta.url);
  const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  return pdfjs;
}

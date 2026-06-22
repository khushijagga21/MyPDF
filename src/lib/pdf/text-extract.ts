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

/** Extract plain text from each PDF page */
export async function extractPdfPageTexts(
  source: File | ArrayBuffer | Uint8Array
): Promise<string[]> {
  const pdfjs = await getPdfJs();
  const data = await toArrayBuffer(source);
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }

  await pdf.cleanup();
  return pages;
}

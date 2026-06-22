import { PDFDocument } from "pdf-lib";

const LOAD_OPTIONS = { ignoreEncryption: true } as const;

export async function mergePdfBuffers(buffers: Uint8Array[]): Promise<Uint8Array> {
  if (buffers.length === 0) {
    throw new Error("No PDF files provided.");
  }

  const merged = await PDFDocument.create();

  for (const bytes of buffers) {
    const pdf = await PDFDocument.load(bytes, LOAD_OPTIONS);
    const indices = pdf.getPageIndices();
    if (indices.length === 0) continue;
    const pages = await merged.copyPages(pdf, indices);
    pages.forEach((page) => merged.addPage(page));
  }

  if (merged.getPageCount() === 0) {
    throw new Error("The selected PDFs contain no pages.");
  }

  return merged.save();
}

export interface PageMergeInput {
  fileId: string;
  pageIndex: number;
}

export async function mergePdfPagesOrdered(
  pages: PageMergeInput[],
  loadBuffer: (fileId: string) => Promise<Uint8Array>
): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new Error("No pages selected to merge.");
  }

  const merged = await PDFDocument.create();
  const cache = new Map<string, Awaited<ReturnType<typeof PDFDocument.load>>>();

  for (const { fileId, pageIndex } of pages) {
    let pdf = cache.get(fileId);
    if (!pdf) {
      const bytes = await loadBuffer(fileId);
      pdf = await PDFDocument.load(bytes, LOAD_OPTIONS);
      cache.set(fileId, pdf);
    }

    if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) {
      throw new Error(`Invalid page index ${pageIndex + 1} for file ${fileId}.`);
    }

    const [page] = await merged.copyPages(pdf, [pageIndex]);
    merged.addPage(page);
  }

  return merged.save();
}

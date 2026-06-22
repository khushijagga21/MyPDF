import { PDFDocument } from "pdf-lib";

const LOAD_OPTIONS = { ignoreEncryption: true } as const;

/** Remove 1-indexed pages and return the remaining PDF */
export async function removePdfPages(
  pdfBytes: Uint8Array,
  pagesToRemove: number[]
): Promise<Uint8Array> {
  const source = await PDFDocument.load(pdfBytes, LOAD_OPTIONS);
  const pageCount = source.getPageCount();

  if (pageCount === 0) {
    throw new Error("The PDF contains no pages.");
  }

  const removeSet = new Set(
    [...new Set(pagesToRemove)].filter((p) => p >= 1 && p <= pageCount)
  );

  if (removeSet.size === 0) {
    throw new Error("Select at least one page to remove.");
  }

  if (removeSet.size >= pageCount) {
    throw new Error("You cannot remove all pages. At least one page must remain.");
  }

  for (const pageNum of pagesToRemove) {
    if (pageNum < 1 || pageNum > pageCount) {
      throw new Error(`Page ${pageNum} is out of range (1–${pageCount}).`);
    }
  }

  const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(
    (i) => !removeSet.has(i + 1)
  );

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, keepIndices);
  pages.forEach((page) => output.addPage(page));

  return output.save();
}

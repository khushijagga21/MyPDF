import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

const LOAD_OPTIONS = { ignoreEncryption: true } as const;

export interface NamedPdf {
  name: string;
  bytes: Uint8Array;
}

async function loadPdf(pdfBytes: Uint8Array) {
  return PDFDocument.load(pdfBytes, LOAD_OPTIONS);
}

export async function getPdfPageCountFromBytes(pdfBytes: Uint8Array): Promise<number> {
  const pdf = await loadPdf(pdfBytes);
  return pdf.getPageCount();
}

/** Extract a page range (1-indexed, inclusive) into a single PDF */
export async function extractPageRange(
  pdfBytes: Uint8Array,
  from: number,
  to: number
): Promise<Uint8Array> {
  const source = await loadPdf(pdfBytes);
  const pageCount = source.getPageCount();

  if (pageCount === 0) {
    throw new Error("The PDF contains no pages.");
  }

  const start = Math.max(1, from);
  const end = Math.min(pageCount, to);

  if (start > end) {
    throw new Error("Start page must be less than or equal to end page.");
  }

  if (start < 1 || end > pageCount) {
    throw new Error(`Page range must be between 1 and ${pageCount}.`);
  }

  const output = await PDFDocument.create();
  const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));

  return output.save();
}

/** Split PDF into chunks of N pages each */
export async function splitEveryNPages(
  pdfBytes: Uint8Array,
  every: number,
  baseName: string
): Promise<NamedPdf[]> {
  if (every < 1) {
    throw new Error("Pages per file must be at least 1.");
  }

  const source = await loadPdf(pdfBytes);
  const total = source.getPageCount();

  if (total === 0) {
    throw new Error("The PDF contains no pages.");
  }

  const results: NamedPdf[] = [];
  let part = 1;

  for (let start = 0; start < total; start += every) {
    const end = Math.min(start + every - 1, total - 1);
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(source, indices);
    pages.forEach((page) => doc.addPage(page));
    const bytes = await doc.save();
    results.push({ name: `${baseName}-part-${part}.pdf`, bytes });
    part++;
  }

  return results;
}

/** Split into individual page PDFs; optional 1-indexed page filter */
export async function splitIndividualPages(
  pdfBytes: Uint8Array,
  baseName: string,
  pages?: number[]
): Promise<NamedPdf[]> {
  const source = await loadPdf(pdfBytes);
  const pageCount = source.getPageCount();

  if (pageCount === 0) {
    throw new Error("The PDF contains no pages.");
  }

  const indices =
    pages && pages.length > 0
      ? [...new Set(pages)].sort((a, b) => a - b)
      : Array.from({ length: pageCount }, (_, i) => i + 1);

  for (const pageNum of indices) {
    if (pageNum < 1 || pageNum > pageCount) {
      throw new Error(`Page ${pageNum} is out of range (1–${pageCount}).`);
    }
  }

  const results: NamedPdf[] = [];

  for (const pageNum of indices) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(source, [pageNum - 1]);
    doc.addPage(page);
    const bytes = await doc.save();
    results.push({ name: `${baseName}-page-${pageNum}.pdf`, bytes });
  }

  return results;
}

export async function packPdfsToZip(files: NamedPdf[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error("No files to package.");
  }

  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.bytes);
  }

  return zip.generateAsync({ type: "uint8array" });
}

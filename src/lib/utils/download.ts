async function loadPdfLib() {
  return import("pdf-lib");
}

/** Trigger a file download in the browser */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export interface MergePageItem {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  file: File;
}

/** Expand uploaded PDFs into individual page items */
export async function expandFilesToPages(
  files: { id: string; name: string; file?: File }[]
): Promise<MergePageItem[]> {
  const { PDFDocument } = await loadPdfLib();
  const items: MergePageItem[] = [];

  for (const fileItem of files) {
    if (!fileItem.file) continue;
    const bytes = await fileItem.file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();

    for (let i = 0; i < count; i++) {
      items.push({
        id: `${fileItem.id}-p${i}`,
        fileId: fileItem.id,
        fileName: fileItem.name,
        pageIndex: i,
        pageNumber: i + 1,
        file: fileItem.file,
      });
    }
  }

  return items;
}

/** Rebuild page list when files are reordered (keeps within-file page order) */
export function reorderPagesByFileOrder(
  pages: MergePageItem[],
  files: { id: string }[]
): MergePageItem[] {
  const result: MergePageItem[] = [];
  for (const file of files) {
    const filePages = pages
      .filter((p) => p.fileId === file.id)
      .sort((a, b) => a.pageIndex - b.pageIndex);
    result.push(...filePages);
  }
  return result;
}

/** Remove pages belonging to a deleted file */
export function removePagesForFile(
  pages: MergePageItem[],
  fileId: string
): MergePageItem[] {
  return pages.filter((p) => p.fileId !== fileId);
}

/** Merge pages in a custom order */
export async function mergePdfPagesInOrder(
  pages: MergePageItem[]
): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();
  const cache = new Map<File, Awaited<ReturnType<typeof PDFDocument.load>>>();

  for (const { file, pageIndex } of pages) {
    let pdf = cache.get(file);
    if (!pdf) {
      const bytes = await file.arrayBuffer();
      pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      cache.set(file, pdf);
    }
    const [page] = await merged.copyPages(pdf, [pageIndex]);
    merged.addPage(page);
  }

  const mergedBytes = await merged.save();
  return new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
}

/** Merge multiple PDF files into one blob (file order, all pages) */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  return new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
}

/** Extract a page range from a PDF (1-indexed, inclusive) */
export async function extractPdfPages(
  file: File,
  from: number,
  to: number
): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const output = await PDFDocument.create();

  const start = Math.max(0, from - 1);
  const end = Math.min(source.getPageCount() - 1, to - 1);
  const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));

  const outBytes = await output.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Re-save a PDF (basic client-side optimization) */
export async function compressPdf(file: File): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const outBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Convert images to a single PDF */
export async function imagesToPdf(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const image = isPng
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);

    const { width, height } = image.scale(1);
    const page = pdf.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const outBytes = await pdf.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return pdf.getPageCount();
}

/** Create a ZIP of placeholder page images (dummy export for PDF→JPG UI) */
export async function createPlaceholderImageZip(
  baseName: string,
  pageCount: number,
  format: "jpg" | "png" = "jpg"
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));

  for (let i = 1; i <= pageCount; i++) {
    const ext = format === "png" ? "png" : "jpg";
    zip.file(`${baseName}-page-${i}.${ext}`, pngBytes);
  }

  return zip.generateAsync({ type: "blob" });
}

/** Split PDF into individual page PDFs packaged as ZIP */
export async function splitPdfToZip(file: File): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const JSZip = (await import("jszip")).default;
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, "");

  for (let i = 0; i < source.getPageCount(); i++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(source, [i]);
    single.addPage(page);
    const pageBytes = await single.save();
    zip.file(`${baseName}-page-${i + 1}.pdf`, pageBytes);
  }

  return zip.generateAsync({ type: "blob" });
}

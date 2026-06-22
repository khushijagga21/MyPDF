import { PDFDocument, degrees } from "pdf-lib";

const LOAD_OPTIONS = { ignoreEncryption: true } as const;

export interface EditPageInput {
  /** 0-indexed page in the source PDF */
  pageIndex: number;
  rotation: number;
}

export async function editPdfPages(
  pdfBytes: Uint8Array,
  pages: EditPageInput[]
): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new Error("At least one page must remain in the document.");
  }

  const source = await PDFDocument.load(pdfBytes, LOAD_OPTIONS);
  const pageCount = source.getPageCount();
  const output = await PDFDocument.create();

  for (const { pageIndex, rotation } of pages) {
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page ${pageIndex + 1} is out of range.`);
    }
    const [page] = await output.copyPages(source, [pageIndex]);
    const normalized = ((rotation % 360) + 360) % 360;
    if (normalized !== 0) {
      page.setRotation(degrees(normalized));
    }
    output.addPage(page);
  }

  return output.save();
}

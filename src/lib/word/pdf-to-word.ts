import {
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from "docx";
import { extractPdfPageTexts } from "@/lib/pdf/text-extract";

/** Build a Word document from extracted page texts */
export async function buildWordDocumentFromPages(
  pages: string[]
): Promise<Blob> {
  if (pages.every((p) => !p.trim())) {
    throw new Error(
      "No text could be extracted. This PDF may be scanned or image-only."
    );
  }

  const children: Paragraph[] = [];

  pages.forEach((text, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(
      new Paragraph({
        text: `Page ${index + 1}`,
        heading: HeadingLevel.HEADING_2,
      })
    );

    const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

    if (blocks.length === 0) {
      children.push(
        new Paragraph({ children: [new TextRun(text.trim() || " ")] })
      );
      return;
    }

    for (const block of blocks) {
      children.push(new Paragraph({ children: [new TextRun(block)] }));
    }
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}

/** Convert a PDF buffer into a Word (.docx) document (server-only). */
export async function pdfToWordFromBuffer(
  pdfBytes: Uint8Array | ArrayBuffer
): Promise<Blob> {
  const pages = await extractPdfPageTexts(pdfBytes);
  return buildWordDocumentFromPages(pages);
}

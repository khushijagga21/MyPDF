import {
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from "docx";
import { extractPdfPageTexts } from "@/lib/pdf/text-extract";

/** Convert extracted PDF text into a Word (.docx) document */
export async function pdfToWord(source: File): Promise<Blob> {
  const pages = await extractPdfPageTexts(source);

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
      children.push(
        new Paragraph({ children: [new TextRun(block)] })
      );
    }
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}

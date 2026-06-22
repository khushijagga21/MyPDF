import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const PARAGRAPH_GAP = 10;
const MAX_CHARS_PER_LINE = 88;

export interface WordDocPreview {
  paragraphs: number;
  characters: number;
  preview: string;
}

export async function getWordDocPreview(
  source: ArrayBuffer
): Promise<WordDocPreview> {
  const result = await mammoth.extractRawText({ arrayBuffer: source });
  const text = result.value.trim();
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  return {
    paragraphs: paragraphs.length || (text ? 1 : 0),
    characters: text.length,
    preview: text.slice(0, 280) + (text.length > 280 ? "…" : ""),
  };
}

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function sanitizeForPdf(text: string): string {
  return text.replace(/[^\x20-\x7E\n\t]/g, " ").replace(/\s+/g, " ").trim();
}

/** Convert a .docx file to a PDF document */
export async function wordToPdf(source: ArrayBuffer): Promise<Uint8Array> {
  const result = await mammoth.extractRawText({ arrayBuffer: source });
  const raw = result.value.trim();

  if (!raw) {
    throw new Error("The Word document appears to be empty.");
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const paragraphs = raw.split(/\n\s*\n/).filter(Boolean);

  for (const paragraph of paragraphs) {
    const lines = wrapLine(sanitizeForPdf(paragraph.replace(/\n/g, " ")), MAX_CHARS_PER_LINE);

    for (const line of lines) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }

      page.drawText(line, {
        x: MARGIN,
        y: y - FONT_SIZE,
        size: FONT_SIZE,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= LINE_HEIGHT;
    }

    y -= PARAGRAPH_GAP;
  }

  return pdfDoc.save();
}

import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 36;
const FONT_SIZE = 8;
const ROW_HEIGHT = 12;
const COL_WIDTH = 72;
const MAX_COLS = 7;
const MAX_CELL_CHARS = 24;

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, MAX_CELL_CHARS);
}

export interface ExcelSheetPreview {
  name: string;
  rows: number;
  cols: number;
}

export function getExcelSheetPreviews(
  source: ArrayBuffer
): ExcelSheetPreview[] {
  const workbook = XLSX.read(source, { type: "array" });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
    return {
      name,
      rows: range.e.r - range.s.r + 1,
      cols: range.e.c - range.s.c + 1,
    };
  });
}

/** Convert an Excel workbook to a PDF with one section per sheet */
export async function excelToPdf(source: ArrayBuffer): Promise<Uint8Array> {
  const workbook = XLSX.read(source, { type: "array" });
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
      sheet,
      { header: 1, defval: "" }
    );

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    page.drawText(sheetName, {
      x: MARGIN,
      y: y - 14,
      size: 12,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.2),
    });
    y -= 26;

    for (const row of data) {
      if (y < MARGIN + ROW_HEIGHT) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }

      let x = MARGIN;
      const cells = Array.isArray(row) ? row : [row];
      const limited = cells.slice(0, MAX_COLS);

      for (const cell of limited) {
        page.drawText(cellText(cell), {
          x,
          y: y - FONT_SIZE,
          size: FONT_SIZE,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
        x += COL_WIDTH;
      }

      y -= ROW_HEIGHT;
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawText("Empty workbook", {
      x: MARGIN,
      y: PAGE_HEIGHT - MARGIN,
      size: 12,
      font,
    });
  }

  return pdfDoc.save();
}

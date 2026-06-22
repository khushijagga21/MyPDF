import * as XLSX from "xlsx";
import { extractPdfPageTexts } from "@/lib/pdf/text-extract";

/** Convert extracted PDF text into an Excel workbook */
export async function pdfToExcel(source: File): Promise<Blob> {
  const pages = await extractPdfPageTexts(source);
  const workbook = XLSX.utils.book_new();

  const summaryRows: (string | number)[][] = [["Page", "Content"]];
  for (let i = 0; i < pages.length; i++) {
    summaryRows.push([i + 1, pages[i]]);
  }
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(summaryRows),
    "By Page"
  );

  const lineRows: (string | number)[][] = [["Page", "Line", "Text"]];
  pages.forEach((text, pageIndex) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0 && text) {
      lineRows.push([pageIndex + 1, 1, text]);
      return;
    }
    lines.forEach((line, lineIndex) => {
      lineRows.push([pageIndex + 1, lineIndex + 1, line]);
    });
  });
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(lineRows),
    "By Line"
  );

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

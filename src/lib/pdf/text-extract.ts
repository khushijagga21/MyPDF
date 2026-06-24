import { loadPdfJsServer } from "@/lib/pdf/pdfjs-server";

async function toArrayBuffer(
  source: File | ArrayBuffer | Uint8Array
): Promise<ArrayBuffer> {
  if (source instanceof File) return source.arrayBuffer();
  if (source instanceof ArrayBuffer) return source;
  return source.buffer.slice(
    source.byteOffset,
    source.byteOffset + source.byteLength
  ) as ArrayBuffer;
}

/** Extract plain text from each PDF page (server-safe). */
export async function extractPdfPageTexts(
  source: File | ArrayBuffer | Uint8Array
): Promise<string[]> {
  const pdfjs = await loadPdfJsServer();
  const data = new Uint8Array(await toArrayBuffer(source));
  const pdf = await pdfjs.getDocument(
    {
      data,
      disableWorker: true,
      useSystemFonts: true,
    } as unknown as Record<string, unknown>
  ).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }

  await pdf.cleanup();
  return pages;
}

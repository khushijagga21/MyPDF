"use client";

import { loadPdfJsClient } from "@/lib/pdf/pdfjs-client";
import type { DummyPage } from "@/lib/data/tool-dummy";

const DEFAULT_MAX_PAGES = 6;
const DEFAULT_SCALE = 0.28;

async function toUint8Array(source: File): Promise<Uint8Array> {
  return new Uint8Array(await source.arrayBuffer());
}

export interface PdfPreviewResult {
  pageCount: number;
  pages: DummyPage[];
}

/** Fast preview: page count + thumbnails for the first few pages in one PDF.js load */
export async function getPdfPreview(
  source: File,
  options?: { maxPages?: number; scale?: number }
): Promise<PdfPreviewResult> {
  const maxThumbPages = options?.maxPages ?? DEFAULT_MAX_PAGES;
  const scale = options?.scale ?? DEFAULT_SCALE;

  const pdfjs = await loadPdfJsClient();
  const data = await toUint8Array(source);
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pageCount = pdf.numPages;
  const thumbLimit = Math.min(pageCount, maxThumbPages);
  const pages: DummyPage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    let thumbnail: string | undefined;

    if (i <= thumbLimit) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext("2d");

        if (context) {
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          thumbnail = canvas.toDataURL("image/jpeg", 0.72);
        }
      } catch {
        // Keep placeholder without thumbnail
      }
    }

    pages.push({
      id: `page-${i}`,
      pageNumber: i,
      thumbnail,
    });
  }

  await pdf.cleanup();
  return { pageCount, pages };
}

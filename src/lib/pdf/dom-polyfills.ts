let installed = false;

/** PDF.js expects browser DOM APIs — polyfill them on Node.js (Vercel serverless). */
export async function ensurePdfDomPolyfills(): Promise<void> {
  if (installed) return;

  if (typeof globalThis.DOMMatrix === "undefined") {
    const mod = await import("dommatrix");
    const DOMMatrixCtor = (mod as { default?: unknown }).default ?? mod;
    globalThis.DOMMatrix =
      DOMMatrixCtor as unknown as typeof globalThis.DOMMatrix;
  }

  if (typeof globalThis.ImageData === "undefined") {
    globalThis.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;

      constructor(
        data: Uint8ClampedArray,
        width: number,
        height?: number
      ) {
        this.data = data;
        this.width = width;
        this.height = height ?? 0;
      }
    } as unknown as typeof globalThis.ImageData;
  }

  if (typeof globalThis.Path2D === "undefined") {
    globalThis.Path2D = class Path2D {
      // Minimal stub — only needed for PDF.js module initialization on Node.
    } as unknown as typeof globalThis.Path2D;
  }

  installed = true;
}

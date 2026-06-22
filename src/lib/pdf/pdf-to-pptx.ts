import PptxGenJS from "pptxgenjs";
import { BRAND_NAME } from "@/lib/brand";

/** Build a PowerPoint file from page image data URLs (one slide per page). Server-only. */
export async function imagesToPptx(
  images: string[],
  title = "Converted PDF"
): Promise<Buffer> {
  if (images.length === 0) {
    throw new Error("No pages to convert.");
  }

  const pptx = new PptxGenJS();
  pptx.author = BRAND_NAME;
  pptx.title = title;
  pptx.layout = "LAYOUT_WIDE";

  for (const dataUrl of images) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: dataUrl,
      x: 0.25,
      y: 0.25,
      w: 12.7,
      h: 7.0,
      sizing: { type: "contain", w: 12.7, h: 7.0 },
    });
  }

  const result = await pptx.write({ outputType: "nodebuffer" });
  return result as Buffer;
}

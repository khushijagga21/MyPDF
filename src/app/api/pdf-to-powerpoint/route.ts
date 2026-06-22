import { NextResponse } from "next/server";
import { imagesToPptx } from "@/lib/pdf/pdf-to-pptx";
import { logToolJob } from "@/lib/db/log-tool-job";

export const runtime = "nodejs";

interface PdfToPowerpointRequest {
  images: string[];
  baseName?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PdfToPowerpointRequest;

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "No page images provided for conversion." },
        { status: 400 }
      );
    }

    const baseName = body.baseName?.replace(/\.pdf$/i, "") || "document";
    const buffer = await imagesToPptx(body.images, baseName);

    await logToolJob({
      tool: "pdf-to-powerpoint",
      inputFileIds: [],
      outputFileName: `${baseName}.pptx`,
      outputSize: buffer.length,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${baseName}.pptx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[pdf-to-powerpoint POST]", err);
    const message =
      err instanceof Error ? err.message : "Failed to convert PDF to PowerPoint.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

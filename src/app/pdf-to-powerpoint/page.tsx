import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const PdfToPowerpointTool = dynamic(
  () =>
    import("@/components/tools/pdf-to-powerpoint/pdf-to-powerpoint-tool").then(
      (m) => m.PdfToPowerpointTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "PDF to PowerPoint",
  description: "Convert PDF pages into a PowerPoint presentation.",
};

export default function PdfToPowerpointPage() {
  return (
    <ToolPageLayout
      title="PDF to PowerPoint"
      description="Turn each PDF page into a slide. Download a .pptx file you can open in PowerPoint, Google Slides, or Keynote."
      icon="presentation"
      iconColor="from-orange-500 to-red-600"
    >
      <PdfToPowerpointTool />
    </ToolPageLayout>
  );
}

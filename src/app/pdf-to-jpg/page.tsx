import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const PdfToJpgTool = dynamic(
  () => import("@/components/tools/pdf-to-jpg/pdf-to-jpg-tool").then((m) => m.PdfToJpgTool),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "PDF to JPG",
  description: "Convert PDF pages to high-quality JPG images.",
};

export default function PdfToJpgPage() {
  return (
    <ToolPageLayout
      title="PDF to JPG"
      description="Extract every page of your PDF as a high-quality JPG or PNG image."
      icon="image-down"
      iconColor="from-amber-500 to-orange-600"
    >
      <PdfToJpgTool />
    </ToolPageLayout>
  );
}

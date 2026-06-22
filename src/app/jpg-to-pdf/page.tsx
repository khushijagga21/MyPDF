import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const JpgToPdfTool = dynamic(
  () => import("@/components/tools/jpg-to-pdf/jpg-to-pdf-tool").then((m) => m.JpgToPdfTool),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "JPG to PDF",
  description: "Convert JPG and PNG images into a polished PDF document.",
};

export default function JpgToPdfPage() {
  return (
    <ToolPageLayout
      title="JPG to PDF"
      description="Convert your images into a single, beautifully formatted PDF document."
      icon="image-up"
      iconColor="from-rose-500 to-pink-600"
    >
      <JpgToPdfTool />
    </ToolPageLayout>
  );
}

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const SplitPdfTool = dynamic(
  () => import("@/components/tools/split-pdf/split-pdf-tool").then((m) => m.SplitPdfTool),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Split PDF",
  description: "Split PDF files into separate documents by page range or individual pages.",
};

export default function SplitPdfPage() {
  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract specific pages or split your PDF into multiple files by page range."
      icon="scissors"
      iconColor="from-cyan-500 to-blue-600"
    >
      <SplitPdfTool />
    </ToolPageLayout>
  );
}

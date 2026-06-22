import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const PdfToWordTool = dynamic(
  () =>
    import("@/components/tools/pdf-to-word/pdf-to-word-tool").then(
      (m) => m.PdfToWordTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "PDF to Word",
  description: "Extract PDF text into an editable Word document.",
};

export default function PdfToWordPage() {
  return (
    <ToolPageLayout
      title="PDF to Word"
      description="Extract text from your PDF into an editable .docx file — one section per page."
      icon="file-type"
      iconColor="from-blue-500 to-indigo-600"
    >
      <PdfToWordTool />
    </ToolPageLayout>
  );
}

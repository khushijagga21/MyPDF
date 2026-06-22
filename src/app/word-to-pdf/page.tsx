import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const WordToPdfTool = dynamic(
  () =>
    import("@/components/tools/word-to-pdf/word-to-pdf-tool").then(
      (m) => m.WordToPdfTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Word to PDF",
  description: "Convert Word documents to PDF files.",
};

export default function WordToPdfPage() {
  return (
    <ToolPageLayout
      title="Word to PDF"
      description="Upload a .docx file and download a clean PDF version you can share or print."
      icon="file-text"
      iconColor="from-sky-500 to-blue-600"
    >
      <WordToPdfTool />
    </ToolPageLayout>
  );
}

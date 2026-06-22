import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const MergePdfTool = dynamic(
  () => import("@/components/tools/merge-pdf/merge-pdf-tool").then((m) => m.MergePdfTool),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Merge PDF",
  description: "Combine multiple PDF files into one document. Free, fast, and private.",
};

export default function MergePdfPage() {
  return (
    <ToolPageLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document. Drag to reorder before merging."
      icon="combine"
      iconColor="from-violet-500 to-indigo-600"
    >
      <MergePdfTool />
    </ToolPageLayout>
  );
}

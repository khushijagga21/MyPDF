import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const EditPdfTool = dynamic(
  () =>
    import("@/components/tools/edit-pdf/edit-pdf-tool").then(
      (m) => m.EditPdfTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Edit PDF",
  description: "Reorder, rotate, and remove pages in your PDF document.",
};

export default function EditPdfPage() {
  return (
    <ToolPageLayout
      title="Edit PDF"
      description="Upload a PDF, rearrange pages, rotate them, or remove unwanted pages — then download the updated file."
      icon="file-pen"
      iconColor="from-indigo-500 to-violet-600"
    >
      <EditPdfTool />
    </ToolPageLayout>
  );
}

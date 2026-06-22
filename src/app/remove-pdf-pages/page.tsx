import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const RemovePdfPagesTool = dynamic(
  () =>
    import("@/components/tools/remove-pdf-pages/remove-pdf-pages-tool").then(
      (m) => m.RemovePdfPagesTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Remove PDF Pages",
  description: "Delete unwanted pages from your PDF and download the edited document.",
};

export default function RemovePdfPagesPage() {
  return (
    <ToolPageLayout
      title="Remove PDF Pages"
      description="Select pages to delete from your PDF. Download a new document with only the pages you want to keep."
      icon="file-minus"
      iconColor="from-red-500 to-rose-600"
    >
      <RemovePdfPagesTool />
    </ToolPageLayout>
  );
}

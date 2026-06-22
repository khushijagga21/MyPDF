import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const PdfToExcelTool = dynamic(
  () =>
    import("@/components/tools/pdf-to-excel/pdf-to-excel-tool").then(
      (m) => m.PdfToExcelTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "PDF to Excel",
  description: "Extract PDF text into an Excel spreadsheet.",
};

export default function PdfToExcelPage() {
  return (
    <ToolPageLayout
      title="PDF to Excel"
      description="Extract text from your PDF into an .xlsx workbook — one sheet by page, one by line."
      icon="table"
      iconColor="from-green-500 to-emerald-600"
    >
      <PdfToExcelTool />
    </ToolPageLayout>
  );
}

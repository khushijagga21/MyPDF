import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const ExcelToPdfTool = dynamic(
  () =>
    import("@/components/tools/excel-to-pdf/excel-to-pdf-tool").then(
      (m) => m.ExcelToPdfTool
    ),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Excel to PDF",
  description: "Convert Excel spreadsheets to PDF documents.",
};

export default function ExcelToPdfPage() {
  return (
    <ToolPageLayout
      title="Excel to PDF"
      description="Upload an Excel or CSV file and download a formatted PDF with your sheet data."
      icon="file-spreadsheet"
      iconColor="from-lime-500 to-green-600"
    >
      <ExcelToPdfTool />
    </ToolPageLayout>
  );
}

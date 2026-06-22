import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolSkeleton } from "@/components/tools/tool-skeleton";

const CompressPdfTool = dynamic(
  () => import("@/components/tools/compress-pdf/compress-pdf-tool").then((m) => m.CompressPdfTool),
  { loading: () => <ToolSkeleton /> }
);

export const metadata: Metadata = {
  title: "Compress PDF",
  description: "Reduce PDF file size while maintaining quality. Choose your compression level.",
};

export default function CompressPdfPage() {
  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Reduce your PDF file size with smart compression. Choose the balance between quality and size."
      icon="minimize"
      iconColor="from-emerald-500 to-teal-600"
    >
      <CompressPdfTool />
    </ToolPageLayout>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table2 } from "lucide-react";
import { FileUploader } from "@/components/upload/file-uploader";
import { PagePreviewGrid } from "@/components/tools/shared/page-preview-grid";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { usePdfUploadPreview } from "@/hooks/use-pdf-upload-preview";
import { pdfToExcelViaFile } from "@/lib/excel/client";
import { formatFileSize } from "@/lib/utils/format";

export function PdfToExcelTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const { file, previewPages, loadingThumbnails, handleFilesChange } =
    usePdfUploadPreview();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [converted, setConverted] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "document";

  const resetOutput = () => {
    setConverted(false);
    setResultBlob(null);
    setError(null);
    setSuccessMessage(null);
  };

  const clearFile = () => {
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const handleConvert = async () => {
    if (!file?.file) {
      setError("Please select a PDF file first.");
      return;
    }

    setProcessing(true);
    resetOutput();

    try {
      const blob = await pdfToExcelViaFile(file.file);
      setResultBlob(blob);
      setConverted(true);
      setSuccessMessage(
        `Extracted text from ${file.pageCount ?? previewPages.length} page${
          (file.pageCount ?? previewPages.length) !== 1 ? "s" : ""
        } into Excel.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <GlassPanel>
          <SectionHeading
            title="Upload a PDF"
            description="Text from each page is extracted into spreadsheet rows"
          />
          <FileUploader
            key={uploadKey}
            category="pdf"
            multiple={false}
            localOnly
            label="Drop your PDF here"
            description="or click to browse your device"
            hint="Single file · Max 50 MB"
            onFilesChange={handleFilesChange}
          />
        </GlassPanel>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <GlassPanel>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} · {file.pageCount} pages
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFile}>
                  Change file
                </Button>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.05}>
              <SectionHeading
                title="Preview"
                description="Works best on PDFs with selectable text, not scanned images"
              />
              <PagePreviewGrid
                pages={previewPages}
                loading={loadingThumbnails}
                columns={3}
              />
            </GlassPanel>

            <GlassPanel delay={0.1}>
              {error && (
                <p className="mb-3 text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
              <LoadingButton
                size="lg"
                className="w-full"
                loading={processing}
                loadingText="Extracting to Excel..."
                onClick={handleConvert}
              >
                <Table2 className="h-5 w-5" aria-hidden />
                Convert to Excel
              </LoadingButton>
            </GlassPanel>

            {converted && resultBlob && (
              <DownloadPanel
                fileName={`${baseName}.xlsx`}
                fileSize={resultBlob.size}
                blob={resultBlob}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <SuccessToast
        message={successMessage ?? ""}
        visible={Boolean(successMessage)}
        onDismiss={() => setSuccessMessage(null)}
      />
    </div>
  );
}

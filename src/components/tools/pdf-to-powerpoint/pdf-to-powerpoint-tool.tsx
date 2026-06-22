"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Presentation } from "lucide-react";
import { FileUploader } from "@/components/upload/file-uploader";
import { deleteUploadedFileFromServer } from "@/lib/upload/client";
import { PagePreviewGrid } from "@/components/tools/shared/page-preview-grid";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { getPdfPageCount } from "@/lib/utils/download";
import { renderPdfThumbnails } from "@/lib/pdf/thumbnails";
import { pdfToPowerpointViaApi } from "@/lib/pdf/client";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";
import type { DummyPage } from "@/lib/data/tool-dummy";

export function PdfToPowerpointTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [previewPages, setPreviewPages] = useState<DummyPage[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
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

  const handleFilesChange = async (uploaded: FileItemData[]) => {
    const item = uploaded[0];
    if (!item?.file) {
      setFile(null);
      setPreviewPages([]);
      return;
    }

    const pageCount = await getPdfPageCount(item.file);
    setFile({ ...item, pageCount });
    setPreviewPages(
      Array.from({ length: pageCount }, (_, i) => ({
        id: `page-${i + 1}`,
        pageNumber: i + 1,
      }))
    );
    resetOutput();

    setLoadingThumbnails(true);
    try {
      const thumbnails = await renderPdfThumbnails(item.file, { scale: 0.5 });
      setPreviewPages(
        thumbnails.map((thumbnail, i) => ({
          id: `page-${i + 1}`,
          pageNumber: i + 1,
          thumbnail,
        }))
      );
    } catch {
      // Keep placeholders on failure
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const clearFile = async () => {
    if (file?.serverId) {
      try {
        await deleteUploadedFileFromServer(file.serverId);
      } catch {
        // ignore
      }
    }
    setFile(null);
    setPreviewPages([]);
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const handleConvert = async () => {
    if (!file?.file) return;

    setProcessing(true);
    resetOutput();

    try {
      const images = await renderPdfThumbnails(file.file, { scale: 0.75 });
      const blob = await pdfToPowerpointViaApi({
        images,
        baseName,
      });
      setResultBlob(blob);
      setConverted(true);
      setSuccessMessage(
        `Created PowerPoint with ${images.length} slide${images.length !== 1 ? "s" : ""}.`
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
            description="Each page becomes one slide in the PowerPoint file"
          />
          <FileUploader
            key={uploadKey}
            category="pdf"
            multiple={false}
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
                    {formatFileSize(file.size)} · {file.pageCount} pages →{" "}
                    {file.pageCount} slides
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void clearFile()}>
                  Change file
                </Button>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.05}>
              <SectionHeading
                title="Preview"
                description="Pages are placed as images on widescreen slides"
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
                loadingText="Converting to PowerPoint..."
                onClick={handleConvert}
              >
                <Presentation className="h-5 w-5" aria-hidden />
                Convert to PowerPoint
              </LoadingButton>
            </GlassPanel>

            {converted && resultBlob && (
              <DownloadPanel
                fileName={`${baseName}.pptx`}
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

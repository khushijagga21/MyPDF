"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { getPdfPageCount } from "@/lib/utils/download";
import { renderPdfThumbnailsProgressive } from "@/lib/pdf/thumbnails";
import { removePdfPagesViaFile } from "@/lib/pdf/client";
import { FileUploader, type FileUploaderHandle } from "@/components/upload/file-uploader";
import { PagePreviewGrid } from "@/components/tools/shared/page-preview-grid";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";
import type { DummyPage } from "@/lib/data/tool-dummy";

export function RemovePdfPagesTool() {
  const uploaderRef = useRef<FileUploaderHandle>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [previewPages, setPreviewPages] = useState<DummyPage[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [pagesToRemove, setPagesToRemove] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const pageCount = file?.pageCount ?? 0;
  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "document";
  const remainingCount = pageCount - pagesToRemove.length;

  const resetOutput = () => {
    setDone(false);
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

    const count = await getPdfPageCount(item.file);
    setFile({ ...item, pageCount: count });
    setPreviewPages(
      Array.from({ length: count }, (_, i) => ({
        id: `page-${i + 1}`,
        pageNumber: i + 1,
      }))
    );
    setPagesToRemove([]);
    resetOutput();

    setLoadingThumbnails(true);
    try {
      await renderPdfThumbnailsProgressive(item.file, {
        scale: 0.28,
        batchSize: 6,
        onBatch: (batch, startIndex) => {
          setPreviewPages((prev) => {
            const next = [...prev];
            batch.forEach((thumbnail, i) => {
              const idx = startIndex + i;
              if (next[idx]) next[idx] = { ...next[idx], thumbnail };
            });
            return next;
          });
        },
      });
    } catch {
      // Keep placeholders if thumbnails fail
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewPages([]);
    setPagesToRemove([]);
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const togglePage = (page: number) => {
    setPagesToRemove((prev) => {
      if (prev.includes(page)) return prev.filter((p) => p !== page);
      if (prev.length >= pageCount - 1) return prev;
      return [...prev, page];
    });
    resetOutput();
  };

  const handleRemove = async () => {
    if (!file?.file) {
      setError("Please select a PDF file first.");
      return;
    }
    if (pagesToRemove.length === 0) {
      setError("Select at least one page to remove.");
      return;
    }

    setProcessing(true);
    resetOutput();

    try {
      const blob = await removePdfPagesViaFile(file.file, {
        removePages: [...pagesToRemove].sort((a, b) => a - b),
        baseName,
      });

      setResultBlob(blob);
      setDone(true);
      setSuccessMessage(
        `Removed ${pagesToRemove.length} page${pagesToRemove.length !== 1 ? "s" : ""}. ${remainingCount} page${remainingCount !== 1 ? "s" : ""} remaining.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove pages.");
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
            description="Select the document you want to edit"
          />
          <FileUploader
            key={uploadKey}
            ref={uploaderRef}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void clearFile()}
                >
                  Change file
                </Button>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.05}>
              <SectionHeading
                title="Select pages to remove"
                description={
                  pagesToRemove.length > 0
                    ? `${pagesToRemove.length} marked for removal · ${remainingCount} will remain`
                    : "Click pages to mark them for removal"
                }
              />
              <PagePreviewGrid
                pages={previewPages}
                selectedPages={pagesToRemove}
                onPageClick={togglePage}
                loading={loadingThumbnails}
                selectionVariant="destructive"
              />
              {pagesToRemove.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPagesToRemove([]);
                      resetOutput();
                    }}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </GlassPanel>

            <GlassPanel delay={0.1}>
              {pagesToRemove.length === 0 && (
                <p className="mb-3 text-sm text-muted-foreground text-center" role="status">
                  Select at least one page to remove
                </p>
              )}
              {error && (
                <p className="mb-3 text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
              <LoadingButton
                size="lg"
                className="w-full"
                disabled={pagesToRemove.length === 0}
                loading={processing}
                loadingText="Removing pages..."
                onClick={handleRemove}
              >
                <Trash2 className="h-5 w-5" aria-hidden />
                Remove {pagesToRemove.length || ""} page
                {pagesToRemove.length !== 1 ? "s" : ""}
              </LoadingButton>
            </GlassPanel>

            {done && resultBlob && (
              <DownloadPanel
                fileName={`${baseName}-edited.pdf`}
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

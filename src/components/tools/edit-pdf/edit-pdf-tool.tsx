"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FilePen,
  RotateCw,
  Trash2,
} from "lucide-react";
import { getPdfPageCount } from "@/lib/utils/download";
import { renderPdfThumbnails } from "@/lib/pdf/thumbnails";
import { editPdfViaApi } from "@/lib/pdf/client";
import { FileUploader } from "@/components/upload/file-uploader";
import { deleteUploadedFileFromServer } from "@/lib/upload/client";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format";
import { cn, focusRing } from "@/lib/utils";
import type { FileItemData } from "@/components/tools/shared/file-card";

interface EditablePage {
  id: string;
  sourcePageIndex: number;
  rotation: number;
  thumbnail?: string;
}

export function EditPdfTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [pages, setPages] = useState<EditablePage[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "document";

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
      setPages([]);
      return;
    }

    const count = await getPdfPageCount(item.file);
    setFile({ ...item, pageCount: count });
    setPages(
      Array.from({ length: count }, (_, i) => ({
        id: `page-${i}`,
        sourcePageIndex: i,
        rotation: 0,
      }))
    );
    resetOutput();

    setLoadingThumbnails(true);
    try {
      const thumbnails = await renderPdfThumbnails(item.file);
      setPages((prev) =>
        prev.map((page, i) => ({
          ...page,
          thumbnail: thumbnails[i],
        }))
      );
    } catch {
      // Keep placeholders if thumbnails fail
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
    setPages([]);
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    resetOutput();
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((page, i) =>
        i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page
      )
    );
    resetOutput();
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
    resetOutput();
  };

  const handleSave = async () => {
    if (!file?.serverId) {
      setError("File is not on the server. Please re-upload your PDF.");
      return;
    }
    if (pages.length === 0) {
      setError("At least one page must remain.");
      return;
    }

    setProcessing(true);
    resetOutput();

    try {
      const blob = await editPdfViaApi({
        fileId: file.serverId,
        pages: pages.map((p) => ({
          pageIndex: p.sourcePageIndex,
          rotation: p.rotation,
        })),
        baseName,
      });

      setResultBlob(blob);
      setDone(true);
      setSuccessMessage(`Saved edited PDF with ${pages.length} page${pages.length !== 1 ? "s" : ""}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit PDF.");
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
            description="Reorder, rotate, or remove pages before downloading"
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
                    {formatFileSize(file.size)} · {pages.length} page
                    {pages.length !== 1 ? "s" : ""} in output
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void clearFile()}>
                  Change file
                </Button>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.05}>
              <SectionHeading
                title="Edit pages"
                description="Reorder with arrows, rotate 90°, or remove pages"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="rounded-xl border border-white/20 bg-white/30 dark:bg-white/5 overflow-hidden"
                  >
                    <div className="relative aspect-[3/4] bg-white dark:bg-zinc-900">
                      {loadingThumbnails && !page.thumbnail ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                        </div>
                      ) : page.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.thumbnail}
                          alt={`Page ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-contain"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                          draggable={false}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                          Page {page.sourcePageIndex + 1}
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {index + 1}
                      </span>
                      {page.rotation > 0 && (
                        <span className="absolute top-2 left-2 rounded-md bg-violet-600/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {page.rotation}°
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 p-2 border-t border-white/10">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => movePage(index, -1)}
                          aria-label={`Move page ${index + 1} left`}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === pages.length - 1}
                          onClick={() => movePage(index, 1)}
                          aria-label={`Move page ${index + 1} right`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8", focusRing)}
                          onClick={() => rotatePage(index)}
                          aria-label={`Rotate page ${index + 1}`}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={pages.length <= 1}
                          onClick={() => removePage(index)}
                          aria-label={`Remove page ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                loadingText="Saving changes..."
                onClick={handleSave}
              >
                <FilePen className="h-5 w-5" aria-hidden />
                Save edited PDF
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

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors } from "lucide-react";
import { getPdfPageCount } from "@/lib/utils/download";
import { renderPdfThumbnailsProgressive } from "@/lib/pdf/thumbnails";
import { splitPdfViaFile } from "@/lib/pdf/client";
import { FileUploader, type FileUploaderHandle } from "@/components/upload/file-uploader";
import { PagePreviewGrid } from "@/components/tools/shared/page-preview-grid";
import { OptionSelector } from "@/components/tools/shared/option-selector";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { splitOptions } from "@/lib/data/tool-dummy";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";
import type { DummyPage } from "@/lib/data/tool-dummy";

export function SplitPdfTool() {
  const uploaderRef = useRef<FileUploaderHandle>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [previewPages, setPreviewPages] = useState<DummyPage[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [splitMode, setSplitMode] = useState("range");
  const [pageFrom, setPageFrom] = useState("1");
  const [pageTo, setPageTo] = useState("3");
  const [everyN, setEveryN] = useState("2");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [split, setSplit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultZip, setResultZip] = useState(false);
  const [outputFileName, setOutputFileName] = useState("split.pdf");

  const resetOutput = () => {
    setSplit(false);
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
    setPageTo(String(Math.min(3, pageCount)));
    resetOutput();
    setSelectedPages([]);

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
      // Keep placeholder previews if rendering fails
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewPages([]);
    resetOutput();
    setSelectedPages([]);
    setUploadKey((k) => k + 1);
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
    resetOutput();
  };

  const pageCount = file?.pageCount ?? 0;
  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "document";

  const handleSplit = async () => {
    if (!file?.file) {
      setError("Please select a PDF file first.");
      return;
    }

    setProcessing(true);
    resetOutput();

    try {
      const from = Math.max(1, parseInt(pageFrom, 10) || 1);
      const to = Math.min(pageCount, parseInt(pageTo, 10) || from);
      const every = Math.max(1, parseInt(everyN, 10) || 2);

      let blob: Blob;

      if (splitMode === "range") {
        if (from > to) {
          throw new Error("Start page must be less than or equal to end page.");
        }
        blob = await splitPdfViaFile(file.file, {
          mode: "range",
          from,
          to,
          baseName,
        });
        setResultZip(false);
        setOutputFileName(`${baseName}-pages-${from}-${to}.pdf`);
        setSuccessMessage(`Extracted pages ${from}–${to} into a new PDF.`);
      } else if (splitMode === "every") {
        blob = await splitPdfViaFile(file.file, {
          mode: "every",
          every,
          baseName,
        });
        const parts = Math.ceil(pageCount / every);
        setResultZip(true);
        setOutputFileName(`${baseName}-split.zip`);
        setSuccessMessage(
          `Split into ${parts} file${parts !== 1 ? "s" : ""} (${every} pages each).`
        );
      } else {
        const pages =
          selectedPages.length > 0
            ? [...selectedPages].sort((a, b) => a - b)
            : undefined;
        const count = pages?.length ?? pageCount;

        blob = await splitPdfViaFile(file.file, {
          mode: "individual",
          pages,
          baseName,
        });
        setResultZip(true);
        setOutputFileName(`${baseName}-pages.zip`);
        setSuccessMessage(
          `Created ${count} individual PDF${count !== 1 ? "s" : ""} in a ZIP archive.`
        );
      }

      setResultBlob(blob);
      setSplit(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const outputCount =
    splitMode === "individual"
      ? selectedPages.length > 0
        ? selectedPages.length
        : pageCount
      : splitMode === "every"
        ? Math.ceil(pageCount / Math.max(1, parseInt(everyN || "2", 10)))
        : 1;

  return (
    <div className="space-y-5">
      {!file ? (
        <GlassPanel>
          <SectionHeading
            title="Upload a PDF"
            description="Select the document you want to split"
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
                title="Split method"
                description="Choose how you want to divide your document"
              />
              <OptionSelector
                options={splitOptions.map((o) => ({ ...o }))}
                value={splitMode}
                onChange={(mode) => {
                  setSplitMode(mode);
                  resetOutput();
                }}
                label="Split method"
              />
            </GlassPanel>

            {splitMode === "range" && (
              <GlassPanel delay={0.08}>
                <SectionHeading title="Page range" description="Enter start and end pages (inclusive)" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">From page</Label>
                    <Input
                      id="from"
                      type="number"
                      min={1}
                      max={pageCount}
                      value={pageFrom}
                      onChange={(e) => {
                        setPageFrom(e.target.value);
                        resetOutput();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">To page</Label>
                    <Input
                      id="to"
                      type="number"
                      min={1}
                      max={pageCount}
                      value={pageTo}
                      onChange={(e) => {
                        setPageTo(e.target.value);
                        resetOutput();
                      }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Pages {pageFrom}–{pageTo} of {pageCount} will be extracted into one PDF.
                </p>
              </GlassPanel>
            )}

            {splitMode === "every" && (
              <GlassPanel delay={0.08}>
                <SectionHeading title="Pages per file" description="Split every N pages" />
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="every">Split every</Label>
                  <Input
                    id="every"
                    type="number"
                    min={1}
                    max={pageCount}
                    value={everyN}
                    onChange={(e) => {
                      setEveryN(e.target.value);
                      resetOutput();
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Creates {outputCount} PDF file{outputCount !== 1 ? "s" : ""} packaged in a ZIP.
                </p>
              </GlassPanel>
            )}

            <GlassPanel delay={0.1}>
              <SectionHeading
                title="Page preview"
                description={
                  splitMode === "individual"
                    ? selectedPages.length > 0
                      ? `${selectedPages.length} page${selectedPages.length !== 1 ? "s" : ""} selected — click to change`
                      : "Click pages to select specific ones, or split all pages"
                    : `All ${file.pageCount} pages shown below`
                }
              />
              <PagePreviewGrid
                pages={previewPages}
                selectedPages={splitMode === "individual" ? selectedPages : []}
                onPageClick={splitMode === "individual" ? togglePage : undefined}
                loading={loadingThumbnails}
              />
            </GlassPanel>

            <GlassPanel delay={0.12}>
              {error && (
                <p className="mb-3 text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
              <LoadingButton
                size="lg"
                className="w-full"
                loading={processing}
                loadingText="Splitting..."
                onClick={handleSplit}
              >
                <Scissors className="h-5 w-5" aria-hidden />
                {splitMode === "range"
                  ? `Extract pages ${pageFrom}–${pageTo}`
                  : `Split into ${outputCount} file${outputCount > 1 ? "s" : ""}`}
              </LoadingButton>
            </GlassPanel>

            {split && resultBlob && (
              <DownloadPanel
                fileName={outputFileName}
                fileSize={resultBlob.size}
                fileCount={resultZip ? outputCount : undefined}
                variant={resultZip ? "zip" : "single"}
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

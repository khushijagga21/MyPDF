"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Combine, LayoutGrid, List, Plus, RotateCcw } from "lucide-react";
import {
  FileUploader,
  type FileUploaderHandle,
} from "@/components/upload/file-uploader";
import { SortableFileList } from "@/components/tools/shared/sortable-file-list";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { SuccessToast } from "@/components/ui/success-toast";
import { Button } from "@/components/ui/button";
import { mergePdfsViaApi } from "@/lib/pdf/client";
import {
  expandFilesToPages,
  reorderPagesByFileOrder,
  type MergePageItem,
} from "@/lib/utils/download";
import { cn } from "@/lib/utils";
import type { FileItemData } from "@/components/tools/shared/file-card";

const SortablePageGrid = dynamic(
  () =>
    import("@/components/tools/merge-pdf/sortable-page-grid").then(
      (m) => m.SortablePageGrid
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted-foreground text-center py-10" role="status">
        Loading pages...
      </p>
    ),
  }
);

type OrganizeMode = "files" | "pages";

export function MergePdfTool() {
  const uploaderRef = useRef<FileUploaderHandle>(null);
  const [files, setFiles] = useState<FileItemData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pages, setPages] = useState<MergePageItem[]>([]);
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const [organizeMode, setOrganizeMode] = useState<OrganizeMode>("files");
  const [loadingPages, setLoadingPages] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [merged, setMerged] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetOutput = () => {
    setMerged(false);
    setMergedBlob(null);
    setError(null);
  };

  const handleFilesChange = useCallback(
    async (readyFiles: FileItemData[]) => {
      setSelectedIds((prev) => {
        const next = new Set<string>();
        for (const file of readyFiles) {
          if (prev.has(file.id)) {
            next.add(file.id);
          } else if (!files.some((f) => f.id === file.id)) {
            next.add(file.id);
          }
        }
        return next;
      });

      setFiles(readyFiles);
      resetOutput();

      if (pagesLoaded) {
        if (readyFiles.length === 0) {
          setPages([]);
          setPagesLoaded(false);
        } else {
          setLoadingPages(true);
          try {
            const expanded = await expandFilesToPages(readyFiles);
            setPages(expanded);
          } finally {
            setLoadingPages(false);
          }
        }
      }
    },
    [files, pagesLoaded]
  );

  const loadPages = useCallback(async () => {
    if (pagesLoaded || files.length === 0) return;
    setLoadingPages(true);
    try {
      const expanded = await expandFilesToPages(files);
      setPages(expanded);
      setPagesLoaded(true);
    } finally {
      setLoadingPages(false);
    }
  }, [files, pagesLoaded]);

  const handleModeChange = async (mode: OrganizeMode) => {
    setOrganizeMode(mode);
    if (mode === "pages") await loadPages();
  };

  const handleFileReorder = (reordered: FileItemData[]) => {
    setFiles(reordered);
    if (pagesLoaded) {
      setPages((prev) => reorderPagesByFileOrder(prev, reordered));
    }
    resetOutput();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    resetOutput();
  };

  const removeFile = (id: string) => {
    uploaderRef.current?.removeFile(id);
  };

  const removePage = (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    resetOutput();
  };

  const resetPageOrder = () => {
    setPages(reorderPagesByFileOrder(pages, files));
    resetOutput();
  };

  const selectedFiles = files.filter((f) => selectedIds.has(f.id));

  const getServerId = (clientFileId: string): string | undefined =>
    files.find((f) => f.id === clientFileId)?.serverId;

  const handleMerge = async () => {
    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let blob: Blob;

      if (organizeMode === "pages" && pagesLoaded && pages.length > 0) {
        const apiPages = pages.map((p) => {
          const serverId = getServerId(p.fileId);
          if (!serverId) {
            throw new Error(
              `"${p.fileName}" is not on the server. Please re-upload it.`
            );
          }
          return { fileId: serverId, pageIndex: p.pageIndex };
        });

        blob = await mergePdfsViaApi({ mode: "pages", pages: apiPages });
        setSuccessMessage(
          `Successfully merged ${pages.length} page${pages.length !== 1 ? "s" : ""} into one PDF.`
        );
      } else {
        if (selectedFiles.length < 2) {
          throw new Error("Select at least 2 PDF files to merge.");
        }

        const fileIds = selectedFiles.map((f) => {
          if (!f.serverId) {
            throw new Error(
              `"${f.name}" failed to upload. Please remove and re-add it.`
            );
          }
          return f.serverId;
        });

        blob = await mergePdfsViaApi({ mode: "files", fileIds });
        setSuccessMessage(
          `Successfully merged ${selectedFiles.length} PDF${selectedFiles.length !== 1 ? "s" : ""} into one document.`
        );
      }

      setMergedBlob(blob);
      setMerged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs.");
      setMerged(false);
    } finally {
      setProcessing(false);
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const pageCount = pagesLoaded ? pages.length : null;
  const canMerge =
    organizeMode === "pages"
      ? pagesLoaded && pages.length >= 1
      : selectedFiles.length >= 1;
  const outputSize = mergedBlob?.size ?? totalSize;

  return (
    <div className="space-y-4 sm:space-y-5">
      <GlassPanel>
        <SectionHeading
          title="Upload PDF files"
          description="Add two or more PDFs to combine into a single document"
        />
        <FileUploader
          ref={uploaderRef}
          category="pdf"
          multiple
          showFileList="active-only"
          label="Drop PDF files here"
          description="or click to browse — select multiple files at once"
          hint="Up to 20 files · Max 50 MB each"
          onFilesChange={handleFilesChange}
        />
      </GlassPanel>

      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-4 sm:space-y-5">
            <GlassPanel delay={0.05}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <SectionHeading
                  title="Organize"
                  description={
                    organizeMode === "files"
                      ? "Select files and reorder — checked files will be merged"
                      : "Drag pages to set the exact merge order"
                  }
                />
                <div
                  role="tablist"
                  aria-label="Organize mode"
                  className="flex rounded-xl border border-white/20 bg-white/30 dark:bg-white/5 p-1 gap-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={organizeMode === "files"}
                    onClick={() => handleModeChange("files")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                      organizeMode === "files"
                        ? "bg-violet-600 text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="h-3.5 w-3.5" aria-hidden />
                    By file
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={organizeMode === "pages"}
                    onClick={() => handleModeChange("pages")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                      organizeMode === "pages"
                        ? "bg-violet-600 text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                    By page
                  </button>
                </div>
              </div>

              {organizeMode === "files" ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedFiles.length} of {files.length} selected
                      {pageCount != null && ` · ${pageCount} pages`}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => uploaderRef.current?.openFilePicker()}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Add more
                    </Button>
                  </div>
                  <SortableFileList
                    files={files}
                    onReorder={handleFileReorder}
                    onRemove={removeFile}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                  />
                </>
              ) : loadingPages ? (
                <p className="text-sm text-muted-foreground text-center py-10" role="status">
                  Loading pages...
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {pages.length} page{pages.length !== 1 ? "s" : ""} — drag to reorder
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={resetPageOrder}>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Reset order
                    </Button>
                  </div>
                  <SortablePageGrid
                    pages={pages}
                    onReorder={(reordered) => {
                      setPages(reordered);
                      resetOutput();
                    }}
                    onRemove={removePage}
                  />
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-white/10 pt-4">
                <span>{files.length} files</span>
                {organizeMode === "files" && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{selectedFiles.length} selected</span>
                  </>
                )}
                {pageCount != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{pageCount} pages</span>
                  </>
                )}
                <span aria-hidden>·</span>
                <span>{(totalSize / (1024 * 1024)).toFixed(1)} MB combined</span>
              </div>
            </GlassPanel>

            <GlassPanel delay={0.1}>
              {selectedFiles.length < 2 && organizeMode === "files" && (
                <p className="mb-3 text-sm text-muted-foreground text-center" role="status">
                  Select at least 2 PDF files to merge
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
                disabled={!canMerge}
                loading={processing}
                loadingText="Merging PDFs..."
                onClick={handleMerge}
              >
                <Combine className="h-5 w-5" aria-hidden />
                Merge{" "}
                {organizeMode === "pages" && pagesLoaded
                  ? `${pages.length} page${pages.length !== 1 ? "s" : ""}`
                  : `${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
              </LoadingButton>
            </GlassPanel>

            {merged && mergedBlob && (
              <DownloadPanel
                fileName="merged-document.pdf"
                fileSize={outputSize}
                blob={mergedBlob}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      <SuccessToast
        message={successMessage ?? ""}
        visible={Boolean(successMessage)}
        onDismiss={() => setSuccessMessage(null)}
      />
    </div>
  );
}

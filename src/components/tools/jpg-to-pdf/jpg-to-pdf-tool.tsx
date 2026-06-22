"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { ImageUp, FileText, Plus } from "lucide-react";
import {
  FileUploader,
  type FileUploaderHandle,
} from "@/components/upload/file-uploader";
import { FileCard, type FileItemData } from "@/components/tools/shared/file-card";
import { OptionSelector } from "@/components/tools/shared/option-selector";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { pageSizeOptions } from "@/lib/data/tool-dummy";
import { imagesToPdf } from "@/lib/utils/download";
import { cn } from "@/lib/utils";

export function JpgToPdfTool() {
  const uploaderRef = useRef<FileUploaderHandle>(null);
  const [files, setFiles] = useState<FileItemData[]>([]);
  const [pageSize, setPageSize] = useState("a4");
  const [converted, setConverted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesChange = useCallback((readyFiles: FileItemData[]) => {
    setFiles(readyFiles);
    setConverted(false);
    setResultBlob(null);
  }, []);

  const removeFile = (id: string) => {
    uploaderRef.current?.removeFile(id);
  };

  const handleConvert = async () => {
    setProcessing(true);
    try {
      const imageFiles = files.map((f) => f.file).filter((f): f is File => Boolean(f));
      const blob = await imagesToPdf(imageFiles);
      setResultBlob(blob);
      setConverted(true);
    } finally {
      setProcessing(false);
    }
  };

  const pageSizeLabel = pageSizeOptions.find((p) => p.id === pageSize)?.label ?? "A4";

  return (
    <div className="space-y-5">
      <GlassPanel>
        <SectionHeading
          title="Upload images"
          description="Add JPG, PNG, or WebP images to convert into a PDF"
        />
        <FileUploader
          ref={uploaderRef}
          category="image"
          multiple
          showFileList="active-only"
          label="Drop images here"
          description="or click to browse — select multiple images"
          hint="Up to 50 images · Max 10 MB each"
          onFilesChange={handleFilesChange}
        />
      </GlassPanel>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <GlassPanel delay={0.05}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                <SectionHeading
                  title={`${files.length} image${files.length > 1 ? "s" : ""}`}
                  description="Drag to set page order in the final PDF"
                />
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
              <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-2">
                {files.map((file, index) => (
                  <Reorder.Item key={file.id} value={file} className="list-none">
                    <FileCard
                      file={file}
                      index={index}
                      onRemove={() => removeFile(file.id)}
                      dragHandle
                      draggable
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </GlassPanel>

            <GlassPanel delay={0.08}>
              <SectionHeading title="Page size" description="Choose the paper size for your PDF" />
              <OptionSelector
                options={pageSizeOptions.map((p) => ({
                  id: p.id,
                  title: p.label,
                  description: p.dimensions,
                }))}
                value={pageSize}
                onChange={setPageSize}
                columns={3}
              />
            </GlassPanel>

            <GlassPanel delay={0.1}>
              <SectionHeading title="Preview" description={`${pageSizeLabel} · ${files.length} pages`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((file, i) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "relative aspect-[3/4] rounded-xl border border-white/20 overflow-hidden bg-white dark:bg-white/5 shadow-sm",
                      pageSize === "letter" && "aspect-[8.5/11]",
                      pageSize === "fit" && "aspect-square"
                    )}
                  >
                    {file.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.thumbnail}
                        alt={`Page ${i + 1}: ${file.name}`}
                        className="absolute inset-0 h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {i + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel delay={0.12}>
              <LoadingButton
                size="lg"
                className="w-full"
                loading={processing}
                loadingText="Creating PDF..."
                onClick={handleConvert}
              >
                <ImageUp className="h-5 w-5" aria-hidden />
                {`Convert to PDF (${files.length} pages)`}
              </LoadingButton>
            </GlassPanel>

            {converted && resultBlob && (
              <DownloadPanel
                fileName="images-combined.pdf"
                fileSize={resultBlob.size}
                blob={resultBlob}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

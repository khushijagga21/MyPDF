"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageDown } from "lucide-react";
import { FileUploader } from "@/components/upload/file-uploader";
import { PagePreviewGrid } from "@/components/tools/shared/page-preview-grid";
import { OptionSelector } from "@/components/tools/shared/option-selector";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { cn, focusRing } from "@/lib/utils";
import {
  imageQualityOptions,
  outputFormatOptions,
} from "@/lib/data/tool-dummy";
import { createPlaceholderImageZip } from "@/lib/utils/download";
import { usePdfUploadPreview } from "@/hooks/use-pdf-upload-preview";
import { formatFileSize } from "@/lib/utils/format";

export function PdfToJpgTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const { file, previewPages, loadingThumbnails, handleFilesChange } =
    usePdfUploadPreview();
  const [quality, setQuality] = useState("high");
  const [format, setFormat] = useState("jpg");
  const [converted, setConverted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const clearFile = () => {
    setConverted(false);
    setResultBlob(null);
    setUploadKey((k) => k + 1);
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const baseName = file.name.replace(/\.pdf$/i, "");
      const blob = await createPlaceholderImageZip(
        baseName,
        file.pageCount ?? 1,
        format as "jpg" | "png"
      );
      setResultBlob(blob);
      setConverted(true);
    } finally {
      setProcessing(false);
    }
  };

  const formatLabel = format.toUpperCase();
  const dpi = imageQualityOptions.find((q) => q.id === quality)?.dpi ?? "300 DPI";

  return (
    <div className="space-y-5">
      <GlassPanel>
        <SectionHeading
          title="Upload PDF"
          description="Select the PDF to convert into images"
        />
        {!file ? (
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
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/30 dark:bg-white/5 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} · {file.pageCount} pages
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
            >
              Change
            </Button>
          </div>
        )}
      </GlassPanel>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <GlassPanel delay={0.05}>
              <SectionHeading title="Image quality" description="Higher DPI = larger files, better print quality" />
              <OptionSelector
                options={imageQualityOptions.map((q) => ({
                  id: q.id,
                  title: q.label,
                  description: q.description,
                  example: q.dpi,
                }))}
                value={quality}
                onChange={setQuality}
                columns={2}
              />
            </GlassPanel>

            <GlassPanel delay={0.07}>
              <SectionHeading title="Output format" />
              <div role="radiogroup" aria-label="Output format" className="flex gap-3">
                {outputFormatOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={format === option.id}
                    onClick={() => setFormat(option.id)}
                    className={cn(
                      "flex-1 rounded-xl border py-3 text-sm font-medium transition-all cursor-pointer",
                      focusRing,
                      format === option.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/20 bg-white/30 dark:bg-white/5 hover:border-white/30 hover:bg-white/40 dark:hover:bg-white/10"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel delay={0.09}>
              <SectionHeading
                title="Page preview"
                description={`${file.pageCount} pages will be exported as ${formatLabel} (${dpi})`}
              />
              <PagePreviewGrid pages={previewPages} columns={4} loading={loadingThumbnails} />
            </GlassPanel>

            {!converted && (
              <GlassPanel delay={0.11}>
                <LoadingButton
                  size="lg"
                  className="w-full"
                  loading={processing}
                  loadingText="Converting pages..."
                  onClick={handleConvert}
                >
                  <ImageDown className="h-5 w-5" aria-hidden />
                  {`Convert ${file.pageCount} pages to ${formatLabel}`}
                </LoadingButton>
              </GlassPanel>
            )}

            {converted && resultBlob && (
              <DownloadPanel
                fileName={`${file.name.replace(/\.pdf$/i, "")}-images.zip`}
                fileSize={resultBlob.size}
                fileCount={file.pageCount}
                variant="zip"
                blob={resultBlob}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

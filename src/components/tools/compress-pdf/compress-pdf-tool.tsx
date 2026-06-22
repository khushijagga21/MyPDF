"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { getPdfPageCount } from "@/lib/utils/download";
import { FileUploader } from "@/components/upload/file-uploader";
import { deleteUploadedFileFromServer } from "@/lib/upload/client";
import { OptionSelector } from "@/components/tools/shared/option-selector";
import { SizeComparison } from "@/components/tools/shared/size-comparison";
import { ProgressIndicator } from "@/components/tools/shared/progress-indicator";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { compressionEstimates } from "@/lib/data/tool-dummy";
import { compressPdf } from "@/lib/utils/download";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";

const compressionLevels = [
  {
    id: "low",
    title: "Low compression",
    description: "Best quality, moderate size reduction",
    example: "~20% smaller",
  },
  {
    id: "medium",
    title: "Recommended",
    description: "Balanced quality and file size",
    example: "~50% smaller",
    badge: "Popular",
  },
  {
    id: "high",
    title: "High compression",
    description: "Smallest file, reduced quality",
    example: "~80% smaller",
  },
];

export function CompressPdfTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [level, setLevel] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesChange = async (uploaded: FileItemData[]) => {
    const item = uploaded[0];
    if (!item?.file) {
      setFile(null);
      return;
    }
    const pageCount = await getPdfPageCount(item.file);
    setFile({ ...item, pageCount });
    setDone(false);
    setResultBlob(null);
    setProgress(0);
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
    setDone(false);
    setResultBlob(null);
    setProgress(0);
    setUploadKey((k) => k + 1);
  };

  const compressedSize = resultBlob?.size ?? (file
    ? Math.round(file.size * (compressionEstimates[level] ?? 0.5))
    : 0);

  const handleCompress = async () => {
    if (!file?.file) return;
    setProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 90));
    }, 120);

    try {
      const blob = await compressPdf(file.file);
      setResultBlob(blob);
      setProgress(100);
      setDone(true);
    } finally {
      clearInterval(interval);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <GlassPanel>
        <SectionHeading
          title="Upload PDF"
          description="Select the file you want to compress"
        />
        {!file ? (
          <FileUploader
            key={uploadKey}
            category="pdf"
            multiple={false}
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
              onClick={() => void clearFile()}
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
              <SectionHeading
                title="Compression level"
                description="Choose the balance between quality and file size"
              />
              <OptionSelector
                options={compressionLevels}
                value={level}
                onChange={setLevel}
                label="Compression level"
              />
            </GlassPanel>

            <SizeComparison
              originalSize={file.size}
              compressedSize={compressedSize}
            />

            {processing && (
              <GlassPanel delay={0.08}>
                <ProgressIndicator progress={progress} label="Compressing PDF..." />
              </GlassPanel>
            )}

            {!done && (
              <GlassPanel delay={0.1}>
                <LoadingButton
                  size="lg"
                  className="w-full"
                  loading={processing}
                  loadingText="Compressing..."
                  onClick={handleCompress}
                >
                  <Minimize2 className="h-5 w-5" aria-hidden />
                  Compress PDF
                </LoadingButton>
              </GlassPanel>
            )}

            {done && resultBlob && (
              <DownloadPanel
                fileName={file.name.replace(/\.pdf$/i, "-compressed.pdf")}
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

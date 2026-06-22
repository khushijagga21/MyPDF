"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle2, FileArchive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format";
import { downloadBlob } from "@/lib/utils/download";

interface DownloadPanelProps {
  fileName: string;
  fileSize?: number;
  fileCount?: number;
  variant?: "single" | "zip";
  blob?: Blob | null;
  onDownload?: () => void | Promise<void>;
}

export function DownloadPanel({
  fileName,
  fileSize,
  fileCount,
  variant = "single",
  blob,
  onDownload,
}: DownloadPanelProps) {
  const [downloading, setDownloading] = useState(false);
  const Icon = variant === "zip" ? FileArchive : CheckCircle2;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (onDownload) {
        await onDownload();
      } else if (blob) {
        downloadBlob(blob, fileName);
      }
    } finally {
      setDownloading(false);
    }
  };

  const canDownload = Boolean(blob || onDownload);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
          <Icon className="h-6 w-6 text-emerald-500" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            {variant === "zip" ? "Ready to download" : "File ready!"}
          </p>
          <p className="text-sm truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fileSize != null && formatFileSize(fileSize)}
            {fileCount != null && fileCount > 1 && ` · ${fileCount} files`}
          </p>
        </div>
        <Button
          type="button"
          onClick={handleDownload}
          disabled={!canDownload || downloading}
          className="shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          aria-label={`Download ${fileName}`}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {downloading ? "Downloading..." : variant === "zip" ? "Download ZIP" : "Download"}
        </Button>
      </div>
    </motion.div>
  );
}

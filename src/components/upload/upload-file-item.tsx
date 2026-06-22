"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format";
import type { UploadItem } from "@/lib/upload/types";
import { cn } from "@/lib/utils";

interface UploadFileItemProps {
  item: UploadItem;
  index: number;
  onRemove: () => void;
  onRetry?: () => void;
}

export function UploadFileItem({
  item,
  index,
  onRemove,
  onRetry,
}: UploadFileItemProps) {
  const isImage = item.mimeType.startsWith("image/");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "rounded-xl border bg-white/50 dark:bg-white/5 backdrop-blur-sm p-3 transition-shadow",
        item.status === "error"
          ? "border-destructive/40 bg-destructive/5"
          : "border-white/20",
        item.status === "success" && "border-emerald-500/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {item.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.previewUrl}
              alt=""
              className="h-12 w-12 rounded-lg object-cover border border-white/20"
            />
          ) : (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg border border-white/20",
                isImage
                  ? "bg-gradient-to-br from-rose-500/20 to-pink-500/20"
                  : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20"
              )}
              aria-hidden
            >
              {isImage ? (
                <ImageIcon className="h-5 w-5 text-rose-500" />
              ) : (
                <FileText className="h-5 w-5 text-violet-500" />
              )}
            </div>
          )}
          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-bold text-white shadow">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(item.size)}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.status === "uploading" && (
            <Loader2
              className="h-4 w-4 animate-spin text-violet-500"
              aria-label="Uploading"
            />
          )}
          {item.status === "success" && (
            <CheckCircle2
              className="h-4 w-4 text-emerald-500"
              aria-label="Uploaded"
            />
          )}
          {item.status === "error" && onRetry && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRetry}
              aria-label={`Retry upload for ${item.name}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            disabled={item.status === "uploading"}
            aria-label={`Remove ${item.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(item.status === "uploading" || item.status === "pending") && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {item.status === "pending" ? "Queued..." : "Uploading..."}
            </span>
            <span className="tabular-nums">{item.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={item.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress for ${item.name}`}
            className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {item.status === "error" && item.error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          {item.error}
        </p>
      )}
    </motion.div>
  );
}

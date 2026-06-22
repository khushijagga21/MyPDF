"use client";

import { motion } from "framer-motion";
import { GripVertical, X, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export interface FileItemData {
  id: string;
  name: string;
  size: number;
  thumbnail?: string;
  type: "pdf" | "image";
  pageCount?: number;
  file?: File;
  serverId?: string;
}

interface FileCardProps {
  file: FileItemData;
  index: number;
  onRemove: () => void;
  draggable?: boolean;
  dragHandle?: boolean;
  isDragging?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
}

export function FileCard({
  file,
  index,
  onRemove,
  draggable = false,
  dragHandle = false,
  isDragging = false,
  selected = true,
  onSelectToggle,
}: FileCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "flex items-center gap-2 sm:gap-3 rounded-xl border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-2.5 sm:p-3 transition-shadow",
        isDragging && "shadow-xl shadow-violet-500/20 border-violet-500/40 z-10",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      {onSelectToggle && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelectToggle}
          aria-label={`Include ${file.name} in merge`}
          className="h-4 w-4 shrink-0 rounded border-white/30 accent-violet-600 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {dragHandle && (
        <div
          className="flex shrink-0 items-center text-muted-foreground/50"
          aria-label={`Drag to reorder ${file.name}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </div>
      )}

      <div className="relative shrink-0">
        {file.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnail}
            alt=""
            className="h-12 w-9 sm:h-14 sm:w-10 rounded-lg object-cover border border-white/20 shadow-sm"
          />
        ) : (
          <div
            className={cn(
              "flex h-12 w-9 sm:h-14 sm:w-10 items-center justify-center rounded-lg border border-white/20 shadow-sm",
              file.type === "pdf"
                ? "bg-gradient-to-br from-violet-500/20 to-indigo-500/20"
                : "bg-gradient-to-br from-rose-500/20 to-pink-500/20"
            )}
            aria-hidden
          >
            {file.type === "pdf" ? (
              <FileText className="h-5 w-5 text-violet-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-rose-500" />
            )}
          </div>
        )}
        <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-bold text-white shadow">
          {index + 1}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
          {file.pageCount ? ` · ${file.pageCount} pages` : ""}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" aria-hidden />
      </Button>
    </motion.div>
  );
}

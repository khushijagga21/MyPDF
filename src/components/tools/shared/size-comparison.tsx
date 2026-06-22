"use client";

import { motion } from "framer-motion";
import { ArrowDown, Minus } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface SizeComparisonProps {
  originalSize: number;
  compressedSize: number;
  originalLabel?: string;
  compressedLabel?: string;
  className?: string;
}

export function SizeComparison({
  originalSize,
  compressedSize,
  originalLabel = "Original",
  compressedLabel = "Compressed",
  className,
}: SizeComparisonProps) {
  const savedPercent = Math.round(((originalSize - compressedSize) / originalSize) * 100);
  const ratio = compressedSize / originalSize;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-medium">File size comparison</p>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          −{savedPercent}% smaller
        </span>
      </div>

      <div className="flex items-end justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 sm:w-20 rounded-t-lg bg-gradient-to-t from-muted-foreground/30 to-muted-foreground/15 transition-all"
            style={{ height: `${Math.max(60, 120)}px` }}
          />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{originalLabel}</p>
            <p className="text-sm font-semibold">{formatFileSize(originalSize)}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pb-8 text-muted-foreground">
          <ArrowDown className="h-4 w-4" />
          <Minus className="h-3 w-3" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 sm:w-20 rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/20 transition-all"
            style={{ height: `${Math.max(24, 120 * ratio)}px` }}
          />
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{compressedLabel}</p>
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
              {formatFileSize(compressedSize)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

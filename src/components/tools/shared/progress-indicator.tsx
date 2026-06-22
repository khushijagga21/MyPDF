"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  progress: number;
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  progress,
  label = "Processing...",
  className,
}: ProgressIndicatorProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium" id="progress-label">
          {label}
        </span>
        <span className="text-muted-foreground tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="progress-label"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-full bg-white/20 dark:bg-white/10"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

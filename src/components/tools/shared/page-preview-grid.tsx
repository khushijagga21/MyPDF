"use client";

import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import type { DummyPage } from "@/lib/data/tool-dummy";

interface PagePreviewGridProps {
  pages: DummyPage[];
  selectedPages?: number[];
  onPageClick?: (pageNumber: number) => void;
  columns?: 2 | 3 | 4;
  className?: string;
  loading?: boolean;
  selectionVariant?: "default" | "destructive";
}

const gradients = [
  "from-violet-500/30 to-indigo-500/30",
  "from-cyan-500/30 to-blue-500/30",
  "from-emerald-500/30 to-teal-500/30",
  "from-amber-500/30 to-orange-500/30",
  "from-rose-500/30 to-pink-500/30",
  "from-purple-500/30 to-violet-500/30",
];

export function PagePreviewGrid({
  pages,
  selectedPages = [],
  onPageClick,
  columns = 4,
  className,
  loading = false,
  selectionVariant = "default",
}: PagePreviewGridProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  const interactive = Boolean(onPageClick);

  if (loading) {
    return (
      <div
        className={cn(`grid ${colClass[columns]} gap-3`, className)}
        role="status"
        aria-label="Loading page previews"
      >
        {pages.map((page) => (
          <div
            key={page.id}
            className="relative aspect-[3/4] rounded-xl border border-white/20 overflow-hidden bg-white/30 dark:bg-white/5 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" aria-hidden />
            <span className="absolute bottom-2 right-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {page.pageNumber}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(`grid ${colClass[columns]} gap-3`, className)}>
      {pages.map((page, i) => {
        const isSelected = selectedPages.includes(page.pageNumber);
        const isDestructive = selectionVariant === "destructive";
        const sharedClass = cn(
          "group relative aspect-[3/4] rounded-xl border overflow-hidden transition-all bg-white dark:bg-zinc-900",
          isSelected
            ? isDestructive
              ? "border-destructive ring-2 ring-destructive/30 shadow-lg shadow-destructive/10"
              : "border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/10"
            : "border-white/20",
          interactive && "cursor-pointer hover:border-violet-500/40",
          interactive && isDestructive && "hover:border-destructive/40",
          interactive && focusRing
        );

        const content = (
          <>
            {page.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.thumbnail}
                alt={`Page ${page.pageNumber} preview`}
                className="absolute inset-0 h-full w-full object-contain bg-white dark:bg-zinc-900"
                draggable={false}
              />
            ) : (
              <>
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    gradients[i % gradients.length]
                  )}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                  <FileText className="h-6 w-6 text-foreground/40" aria-hidden />
                  <div className="space-y-1 w-full px-2" aria-hidden>
                    <div className="h-1 rounded-full bg-foreground/10 w-full" />
                    <div className="h-1 rounded-full bg-foreground/10 w-3/4 mx-auto" />
                    <div className="h-1 rounded-full bg-foreground/10 w-1/2 mx-auto" />
                  </div>
                </div>
              </>
            )}
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-white">
              {page.pageNumber}
            </span>
            {page.label && (
              <span className="absolute top-2 left-2 rounded-md bg-violet-600/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-white">
                {page.label}
              </span>
            )}
            {isSelected && (
              <span
                className={cn(
                  "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow",
                  isDestructive ? "bg-destructive" : "bg-violet-600"
                )}
              >
                {isDestructive ? "✕" : "✓"}
              </span>
            )}
          </>
        );

        if (interactive) {
          return (
            <motion.button
              key={page.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onPageClick?.(page.pageNumber)}
              aria-label={`Page ${page.pageNumber}${isSelected ? ", selected" : ""}`}
              aria-pressed={isSelected}
              className={sharedClass}
            >
              {content}
            </motion.button>
          );
        }

        return (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={sharedClass}
            aria-label={`Page ${page.pageNumber} preview`}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}

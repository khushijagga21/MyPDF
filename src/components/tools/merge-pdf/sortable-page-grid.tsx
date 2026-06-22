"use client";

import { Reorder } from "framer-motion";
import { GripVertical, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MergePageItem } from "@/lib/utils/download";

const gradients = [
  "from-violet-500/30 to-indigo-500/30",
  "from-cyan-500/30 to-blue-500/30",
  "from-emerald-500/30 to-teal-500/30",
  "from-amber-500/30 to-orange-500/30",
  "from-rose-500/30 to-pink-500/30",
  "from-purple-500/30 to-violet-500/30",
];

interface SortablePageGridProps {
  pages: MergePageItem[];
  onReorder: (pages: MergePageItem[]) => void;
  onRemove: (id: string) => void;
}

export function SortablePageGrid({
  pages,
  onReorder,
  onRemove,
}: SortablePageGridProps) {
  return (
    <Reorder.Group
      axis="y"
      values={pages}
      onReorder={onReorder}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      role="list"
      aria-label="PDF pages, drag to reorder"
    >
      {pages.map((page, index) => (
        <Reorder.Item
          key={page.id}
          value={page}
          className="list-none"
        >
          <div
            className={cn(
              "group relative aspect-[3/4] rounded-xl border border-white/20 overflow-hidden",
              "bg-white/40 dark:bg-white/5 cursor-grab active:cursor-grabbing",
              "hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                gradients[index % gradients.length]
              )}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
              <FileText className="h-5 w-5 text-foreground/40" aria-hidden />
              <div className="space-y-0.5 w-full px-2" aria-hidden>
                <div className="h-0.5 rounded-full bg-foreground/10 w-full" />
                <div className="h-0.5 rounded-full bg-foreground/10 w-3/4 mx-auto" />
              </div>
            </div>

            {/* Global order badge */}
            <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-bold text-white shadow">
              {index + 1}
            </span>

            {/* Source file label */}
            <span
              className="absolute top-1.5 right-1.5 max-w-[60%] truncate rounded-md bg-black/50 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-medium text-white"
              title={page.fileName}
            >
              p.{page.pageNumber}
            </span>

            {/* Source file name at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm px-1.5 py-1">
              <p className="text-[9px] text-white truncate" title={page.fileName}>
                {page.fileName}
              </p>
            </div>

            {/* Drag handle */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-black/40 p-1.5"
              aria-hidden
            >
              <GripVertical className="h-4 w-4 text-white" />
            </div>

            {/* Remove page */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(page.id);
              }}
              aria-label={`Remove page ${index + 1} from ${page.fileName}`}
              className="absolute right-1 bottom-8 h-6 w-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/40 hover:bg-destructive/80 text-white hover:text-white transition-opacity"
            >
              <X className="h-3 w-3" aria-hidden />
            </Button>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

"use client";

import { useId, useState } from "react";
import { Upload, CloudUpload } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

interface UploadZoneProps {
  accept?: string;
  multiple?: boolean;
  label?: string;
  description?: string;
  hint?: string;
  onFiles: (files: FileList) => void;
  className?: string;
  compact?: boolean;
}

export function UploadZone({
  accept = ".pdf",
  multiple = false,
  label = "Drop your files here",
  description = "or click to browse from your device",
  hint,
  onFiles,
  className,
  compact = false,
}: UploadZoneProps) {
  const hintId = useId();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/30 dark:bg-white/5 backdrop-blur-xl transition-all cursor-pointer",
        "hover:border-violet-500/40 hover:bg-violet-500/5",
        isDragging
          ? "border-violet-500/60 bg-violet-500/10 scale-[1.01]"
          : "border-white/20",
        focusRing,
        compact ? "p-8" : "p-10 sm:p-12",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => e.target.files && onFiles(e.target.files)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105 group-focus-within:scale-105">
        {isDragging ? (
          <CloudUpload className="h-7 w-7 text-white" aria-hidden />
        ) : (
          <Upload className="h-7 w-7 text-white" aria-hidden />
        )}
      </div>
      <p className="text-base font-semibold mb-1">{label}</p>
      <p className="text-sm text-muted-foreground text-center px-2">{description}</p>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground mt-3">
          {hint}
        </p>
      )}
    </label>
  );
}

"use client";

import {
  forwardRef,
  useImperativeHandle,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Upload, CloudUpload, AlertCircle } from "lucide-react";
import { UploadFileItem } from "@/components/upload/upload-file-item";
import { useFileUpload } from "@/hooks/use-file-upload";
import type { UploadCategory } from "@/lib/upload/types";
import type { FileItemData } from "@/components/tools/shared/file-card";
import { cn, focusRing } from "@/lib/utils";

export interface FileUploaderHandle {
  openFilePicker: () => void;
  addFiles: (files: FileList) => void;
  removeFile: (clientId: string) => void;
}

interface FileUploaderProps {
  category: UploadCategory;
  multiple?: boolean;
  label?: string;
  description?: string;
  hint?: string;
  onFilesChange?: (files: FileItemData[]) => void;
  className?: string;
  compact?: boolean;
  hideDropZone?: boolean;
  showFileList?: boolean | "active-only";
}

export const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(
  function FileUploader(
    {
      category,
      multiple = true,
      label = "Drop your files here",
      description = "or click to browse from your device",
      hint,
      onFilesChange,
      className,
      compact = false,
      hideDropZone = false,
      showFileList = true,
    },
    ref
  ) {
    const hintId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {
      items,
      globalError,
      clearGlobalError,
      addFiles,
      removeItem,
      retryItem,
      limits,
    } = useFileUpload({ category, multiple, onFilesChange });

    useImperativeHandle(ref, () => ({
      openFilePicker: () => inputRef.current?.click(),
      addFiles,
      removeFile: removeItem,
    }));

    const defaultHint =
      hint ??
      `Up to ${limits.maxFiles} files · Max ${(limits.maxSize / (1024 * 1024)).toFixed(0)} MB each`;

    const handleFiles = (fileList: FileList) => {
      clearGlobalError();
      addFiles(fileList);
      if (inputRef.current) inputRef.current.value = "";
    };

    return (
      <div className={cn("space-y-4", className)}>
        {!hideDropZone && (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/30 dark:bg-white/5 backdrop-blur-xl transition-all cursor-pointer",
              "hover:border-violet-500/40 hover:bg-violet-500/5",
              isDragging
                ? "border-violet-500/60 bg-violet-500/10 scale-[1.01]"
                : "border-white/20",
              focusRing,
              compact ? "p-8" : "p-10 sm:p-12"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={limits.accept}
              multiple={multiple}
              aria-describedby={hintId}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
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
            <p className="text-sm text-muted-foreground text-center px-2">
              {description}
            </p>
            <p id={hintId} className="text-xs text-muted-foreground mt-3">
              {defaultHint}
            </p>
          </label>
        )}

        {globalError && (
          <p
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            {globalError}
          </p>
        )}

        {showFileList !== false &&
          (showFileList === "active-only"
            ? items.filter((i) => i.status !== "success")
            : items
          ).length > 0 && (
          <ul className="space-y-2" aria-label="Uploaded files">
            <AnimatePresence mode="popLayout">
              {(showFileList === "active-only"
                ? items.filter((i) => i.status !== "success")
                : items
              ).map((item, index) => (
                <li key={item.clientId}>
                  <UploadFileItem
                    item={item}
                    index={index}
                    onRemove={() => removeItem(item.clientId)}
                    onRetry={
                      item.status === "error"
                        ? () => retryItem(item.clientId)
                        : undefined
                    }
                  />
                </li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    );
  }
);

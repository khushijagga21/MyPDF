"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddFilesButtonProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  label?: string;
}

export function AddFilesButton({
  accept,
  multiple = true,
  onFiles,
  label = "Add more",
}: AddFilesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Plus className="h-4 w-4" aria-hidden />
        {label}
      </Button>
    </>
  );
}

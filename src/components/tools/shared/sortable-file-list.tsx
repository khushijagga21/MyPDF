"use client";

import { Reorder } from "framer-motion";
import { FileCard, type FileItemData } from "@/components/tools/shared/file-card";

interface SortableFileListProps {
  files: FileItemData[];
  onReorder: (files: FileItemData[]) => void;
  onRemove: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function SortableFileList({
  files,
  onReorder,
  onRemove,
  selectedIds,
  onToggleSelect,
}: SortableFileListProps) {
  return (
    <Reorder.Group
      axis="y"
      values={files}
      onReorder={onReorder}
      className="space-y-2"
      role="list"
      aria-label="File list, drag to reorder"
    >
      {files.map((file, index) => (
        <Reorder.Item key={file.id} value={file} className="list-none">
          <FileCard
            file={file}
            index={index}
            onRemove={() => onRemove(file.id)}
            draggable
            dragHandle
            selected={selectedIds ? selectedIds.has(file.id) : true}
            onSelectToggle={
              onToggleSelect ? () => onToggleSelect(file.id) : undefined
            }
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

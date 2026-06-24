"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_LIMITS } from "@/lib/upload/config";
import {
  deleteUploadedFileFromServer,
  uploadFileToServer,
} from "@/lib/upload/client";
import type { UploadCategory, UploadItem } from "@/lib/upload/types";
import { validateFileBatch } from "@/lib/upload/validation";
import { generateId } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";

interface UseFileUploadOptions {
  category: UploadCategory;
  multiple?: boolean;
  /** Keep files local only — skips slow server upload when processing happens in-browser */
  localOnly?: boolean;
  onFilesChange?: (files: FileItemData[]) => void;
}

function inferFileType(
  category: UploadCategory,
  mimeType: string
): FileItemData["type"] {
  if (category === "image") return "image";
  if (category === "pdf") return "pdf";
  return mimeType.startsWith("image/") ? "image" : "pdf";
}

function toFileItemData(item: UploadItem, category: UploadCategory): FileItemData {
  return {
    id: item.clientId,
    name: item.name,
    size: item.size,
    type: inferFileType(category, item.mimeType),
    file: item.localFile,
    serverId: item.serverId,
    thumbnail: item.previewUrl,
  };
}

export function useFileUpload({
  category,
  multiple = true,
  localOnly = false,
  onFilesChange,
}: UseFileUploadOptions) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const notifyChange = useCallback(
    (nextItems: UploadItem[]) => {
      if (!onFilesChange) return;
      const ready = nextItems
        .filter(
          (i) =>
            i.localFile &&
            (localOnly ? i.status !== "error" : i.status === "success")
        )
        .map((i) => toFileItemData(i, category));
      onFilesChange(ready);
    },
    [category, localOnly, onFilesChange]
  );

  const uploadOne = useCallback(
    async (clientId: string, file: File) => {
      setItems((prev) =>
        prev.map((i) =>
          i.clientId === clientId ? { ...i, status: "uploading", progress: 0 } : i
        )
      );

      try {
        const record = await uploadFileToServer(file, category, (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.clientId === clientId ? { ...i, progress } : i))
          );
        });

        setItems((prev) => {
          const next = prev.map((i) =>
            i.clientId === clientId
              ? {
                  ...i,
                  status: "success" as const,
                  progress: 100,
                  serverId: record.id,
                  record,
                }
              : i
          );
          notifyChange(next);
          return next;
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed.";
        setItems((prev) =>
          prev.map((i) =>
            i.clientId === clientId
              ? { ...i, status: "error" as const, error: message }
              : i
          )
        );
      }
    },
    [category, notifyChange]
  );

  const addFiles = useCallback(
    async (fileList: FileList) => {
      const incoming = multiple ? Array.from(fileList) : [fileList[0]].filter(Boolean);
      if (incoming.length === 0) return;

      const successCount = itemsRef.current.filter(
        (i) => i.status === "success" || i.status === "uploading" || i.status === "pending"
      ).length;

      const validation = validateFileBatch(
        incoming.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        category,
        successCount
      );

      if (!validation.valid) {
        setGlobalError(validation.errors[0]?.message ?? "Invalid file(s).");
        return;
      }

      setGlobalError(null);

      const newItems: UploadItem[] = incoming.map((file) => {
        const previewUrl = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;
        return {
          clientId: generateId(),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          status: localOnly ? ("success" as const) : ("pending" as const),
          progress: localOnly ? 100 : 0,
          localFile: file,
          previewUrl,
        };
      });

      const maxFiles = CATEGORY_LIMITS[category].maxFiles;

      if (!multiple && itemsRef.current.length > 0) {
        for (const old of itemsRef.current) {
          if (old.previewUrl) URL.revokeObjectURL(old.previewUrl);
          if (old.serverId) {
            try {
              await deleteUploadedFileFromServer(old.serverId);
            } catch {
              // ignore
            }
          }
        }
      }

      const combined = multiple
        ? [...itemsRef.current, ...newItems].slice(0, maxFiles)
        : newItems;

      setItems(combined);

      if (localOnly) {
        notifyChange(combined);
      } else {
        for (const item of newItems) {
          if (item.localFile) {
            void uploadOne(item.clientId, item.localFile);
          }
        }
      }
    },
    [category, localOnly, multiple, notifyChange, uploadOne]
  );

  const removeItem = useCallback(
    async (clientId: string) => {
      const item = itemsRef.current.find((i) => i.clientId === clientId);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);

      if (item?.serverId) {
        try {
          await deleteUploadedFileFromServer(item.serverId);
        } catch {
          // allow UI removal even if server delete fails
        }
      }

      setItems((prev) => {
        const next = prev.filter((i) => i.clientId !== clientId);
        notifyChange(next);
        return next;
      });
    },
    [notifyChange]
  );

  const retryItem = useCallback(
    (clientId: string) => {
      const item = itemsRef.current.find((i) => i.clientId === clientId);
      if (!item?.localFile) return;
      void uploadOne(clientId, item.localFile);
    },
    [uploadOne]
  );

  const clearAll = useCallback(async () => {
    const current = itemsRef.current;
    for (const item of current) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.serverId) {
        try {
          await deleteUploadedFileFromServer(item.serverId);
        } catch {
          // ignore
        }
      }
    }
    setItems([]);
    notifyChange([]);
  }, [notifyChange]);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const readyFiles = items
    .filter((i) => i.status === "success" && i.localFile)
    .map((i) => toFileItemData(i, category));

  return {
    items,
    readyFiles,
    globalError,
    clearGlobalError: () => setGlobalError(null),
    addFiles,
    removeItem,
    retryItem,
    clearAll,
    limits: CATEGORY_LIMITS[category],
  };
}

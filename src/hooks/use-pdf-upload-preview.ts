"use client";

import { useCallback, useRef, useState } from "react";
import { getPdfPageCount } from "@/lib/utils/download";
import { renderPdfThumbnailsProgressive } from "@/lib/pdf/thumbnails";
import { getPdfPreview } from "@/lib/pdf/pdf-preview";
import type { FileItemData } from "@/components/tools/shared/file-card";
import type { DummyPage } from "@/lib/data/tool-dummy";

interface UsePdfUploadPreviewOptions {
  /** Load thumbnails for every page (split/remove tools) */
  previewAllPages?: boolean;
  /** Max thumbnail pages when previewAllPages is false */
  previewMaxPages?: number;
  /** Skip thumbnail rendering entirely (powerpoint) */
  skipThumbnails?: boolean;
}

function scheduleIdle(task: () => void) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout: 400 });
  } else {
    setTimeout(task, 0);
  }
}

export function usePdfUploadPreview(options: UsePdfUploadPreviewOptions = {}) {
  const {
    previewAllPages = false,
    previewMaxPages = 6,
    skipThumbnails = false,
  } = options;

  const previewToken = useRef(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [previewPages, setPreviewPages] = useState<DummyPage[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);

  const handleFilesChange = useCallback(
    async (uploaded: FileItemData[]) => {
      const item = uploaded[0];
      if (!item?.file) {
        previewToken.current += 1;
        setFile(null);
        setPreviewPages([]);
        setLoadingThumbnails(false);
        return;
      }

      const token = ++previewToken.current;
      const localFile = item.file;

      const pageCount = await getPdfPageCount(localFile);
      if (token !== previewToken.current) return;

      setFile({ ...item, pageCount });
      setPreviewPages(
        Array.from({ length: pageCount }, (_, i) => ({
          id: `page-${i + 1}`,
          pageNumber: i + 1,
        }))
      );

      if (skipThumbnails) return;

      const loadThumbs = async () => {
        if (token !== previewToken.current) return;
        setLoadingThumbnails(true);

        try {
          if (previewAllPages) {
            await renderPdfThumbnailsProgressive(localFile, {
              scale: 0.28,
              batchSize: 6,
              onBatch: (batch, startIndex) => {
                if (token !== previewToken.current) return;
                setPreviewPages((prev) => {
                  const next = [...prev];
                  batch.forEach((thumbnail, i) => {
                    const idx = startIndex + i;
                    if (next[idx]) next[idx] = { ...next[idx], thumbnail };
                  });
                  return next;
                });
              },
            });
          } else {
            const preview = await getPdfPreview(localFile, {
              maxPages: previewMaxPages,
            });
            if (token !== previewToken.current) return;
            setPreviewPages(preview.pages);
          }
        } catch {
          // Keep placeholders on failure
        } finally {
          if (token === previewToken.current) setLoadingThumbnails(false);
        }
      };

      scheduleIdle(() => void loadThumbs());
    },
    [previewAllPages, previewMaxPages, skipThumbnails]
  );

  return {
    file,
    setFile,
    previewPages,
    setPreviewPages,
    loadingThumbnails,
    handleFilesChange,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, Wand2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface UploadItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: string;
  downloadUrl: string;
}

interface ProcessedItem {
  id: string;
  tool: string;
  status: string;
  outputFileName: string | null;
  outputSize: number | null;
  createdAt: string;
  sourceFile: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
  } | null;
}

export function ProfilePanel() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [processed, setProcessed] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      const data = (await res.json()) as {
        error?: string;
        uploads?: UploadItem[];
        processed?: ProcessedItem[];
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load profile.");
      }

      setUploads(data.uploads ?? []);
      setProcessed(data.processed ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Profile unavailable"
        description={error}
        action={
          <Button variant="outline" size="sm" onClick={() => void loadProfile()}>
            Try again
          </Button>
        }
      />
    );
  }

  const formatTool = (tool: string) =>
    tool.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-5">
      <GlassPanel>
        <SectionHeading
          title="Uploaded documents"
          description="Files you uploaded while signed in"
        />
        {uploads.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              No uploads yet. Use any tool while logged in to save files here.
            </p>
            <Button asChild>
              <Link href="/merge-pdf">Start with Merge PDF</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {uploads.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/20 dark:bg-white/5 px-3 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-violet-500 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} ·{" "}
                      {new Date(file.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={file.downloadUrl} download={file.originalName}>
                    <Download className="h-4 w-4" aria-hidden />
                    Download
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      <GlassPanel delay={0.05}>
        <SectionHeading
          title="Updated documents"
          description="Your recent tool activity (these entries reference the source upload)"
        />
        {processed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No processed documents yet. Run a tool while logged in to see activity here.
          </p>
        ) : (
          <ul className="space-y-2">
            {processed
              .filter((item) => item.tool !== "upload")
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/20 dark:bg-white/5 px-3 py-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Wand2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium">{formatTool(item.tool)}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.outputFileName ?? "Output file"}
                        {item.outputSize != null && ` · ${formatFileSize(item.outputSize)}`}
                      </p>
                      {item.sourceFile && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          From: {item.sourceFile.originalName}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/80 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {item.sourceFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <a
                        href={`/api/upload/${item.sourceFile.id}`}
                        download={item.sourceFile.originalName}
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Source
                      </a>
                    </Button>
                  )}
                </li>
              ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}

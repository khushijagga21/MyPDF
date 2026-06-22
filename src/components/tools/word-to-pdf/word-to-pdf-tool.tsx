"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { FileUploader } from "@/components/upload/file-uploader";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  getWordDocPreview,
  wordToPdf,
  type WordDocPreview,
} from "@/lib/word/word-to-pdf";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";

export function WordToPdfTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [preview, setPreview] = useState<WordDocPreview | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [converted, setConverted] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const baseName = file?.name.replace(/\.docx$/i, "") ?? "document";

  const resetOutput = () => {
    setConverted(false);
    setResultBlob(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleFilesChange = async (uploaded: FileItemData[]) => {
    const item = uploaded[0];
    if (!item?.file) {
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(item);
    resetOutput();

    try {
      const buffer = await item.file.arrayBuffer();
      setPreview(await getWordDocPreview(buffer));
    } catch {
      setPreview(null);
      setError("Could not read the Word file. Use a .docx document.");
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const handleConvert = async () => {
    if (!file?.file) return;

    setProcessing(true);
    resetOutput();

    try {
      const buffer = await file.file.arrayBuffer();
      const pdfBytes = await wordToPdf(buffer);
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      setResultBlob(blob);
      setConverted(true);
      setSuccessMessage("Word document converted to PDF.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert Word file.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <GlassPanel>
          <SectionHeading
            title="Upload a Word document"
            description="Supports .docx files (Microsoft Word 2007+)"
          />
          <FileUploader
            key={uploadKey}
            category="word"
            multiple={false}
            label="Drop your Word file here"
            description="or click to browse your device"
            hint="Single file · Max 50 MB · .docx only"
            onFilesChange={handleFilesChange}
          />
        </GlassPanel>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <GlassPanel>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                    {preview &&
                      ` · ${preview.paragraphs} paragraph${preview.paragraphs !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFile}>
                  Change file
                </Button>
              </div>
            </GlassPanel>

            {preview?.preview && (
              <GlassPanel delay={0.05}>
                <SectionHeading
                  title="Document preview"
                  description={`${preview.characters.toLocaleString()} characters extracted`}
                />
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-lg border border-white/15 bg-white/20 dark:bg-white/5 p-4">
                  {preview.preview}
                </p>
              </GlassPanel>
            )}

            <GlassPanel delay={0.1}>
              {error && (
                <p className="mb-3 text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
              <LoadingButton
                size="lg"
                className="w-full"
                loading={processing}
                loadingText="Converting to PDF..."
                onClick={handleConvert}
              >
                <FileText className="h-5 w-5" aria-hidden />
                Convert to PDF
              </LoadingButton>
            </GlassPanel>

            {converted && resultBlob && (
              <DownloadPanel
                fileName={`${baseName}.pdf`}
                fileSize={resultBlob.size}
                blob={resultBlob}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <SuccessToast
        message={successMessage ?? ""}
        visible={Boolean(successMessage)}
        onDismiss={() => setSuccessMessage(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet } from "lucide-react";
import { FileUploader } from "@/components/upload/file-uploader";
import { DownloadPanel } from "@/components/tools/shared/download-panel";
import { GlassPanel, SectionHeading } from "@/components/tools/shared/glass-panel";
import { SuccessToast } from "@/components/ui/success-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  excelToPdf,
  getExcelSheetPreviews,
  type ExcelSheetPreview,
} from "@/lib/excel/excel-to-pdf";
import { formatFileSize } from "@/lib/utils/format";
import type { FileItemData } from "@/components/tools/shared/file-card";

export function ExcelToPdfTool() {
  const [uploadKey, setUploadKey] = useState(0);
  const [file, setFile] = useState<FileItemData | null>(null);
  const [sheets, setSheets] = useState<ExcelSheetPreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [converted, setConverted] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const baseName =
    file?.name.replace(/\.(xlsx|xls|csv)$/i, "") ?? "spreadsheet";

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
      setSheets([]);
      return;
    }

    setFile(item);
    resetOutput();

    try {
      const buffer = await item.file.arrayBuffer();
      setSheets(getExcelSheetPreviews(buffer));
    } catch {
      setSheets([]);
      setError("Could not read the spreadsheet. Check the file format.");
    }
  };

  const clearFile = () => {
    setFile(null);
    setSheets([]);
    resetOutput();
    setUploadKey((k) => k + 1);
  };

  const handleConvert = async () => {
    if (!file?.file) return;

    setProcessing(true);
    resetOutput();

    try {
      const buffer = await file.file.arrayBuffer();
      const pdfBytes = await excelToPdf(buffer);
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      setResultBlob(blob);
      setConverted(true);
      setSuccessMessage(
        `Created PDF from ${sheets.length} sheet${sheets.length !== 1 ? "s" : ""}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert Excel.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <GlassPanel>
          <SectionHeading
            title="Upload a spreadsheet"
            description="Supports .xlsx, .xls, and .csv files"
          />
          <FileUploader
            key={uploadKey}
            category="excel"
            multiple={false}
            localOnly
            label="Drop your Excel file here"
            description="or click to browse your device"
            hint="Single file · Max 50 MB"
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
                    {sheets.length > 0 &&
                      ` · ${sheets.length} sheet${sheets.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFile}>
                  Change file
                </Button>
              </div>
            </GlassPanel>

            {sheets.length > 0 && (
              <GlassPanel delay={0.05}>
                <SectionHeading
                  title="Sheets to include"
                  description="Each sheet becomes a section in the PDF"
                />
                <ul className="space-y-2">
                  {sheets.map((sheet) => (
                    <li
                      key={sheet.name}
                      className="flex items-center justify-between rounded-lg border border-white/15 bg-white/20 dark:bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="font-medium truncate">{sheet.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {sheet.rows} rows × {sheet.cols} cols
                      </span>
                    </li>
                  ))}
                </ul>
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
                <FileSpreadsheet className="h-5 w-5" aria-hidden />
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

import type { UploadCategory } from "@/lib/upload/types";

export const UPLOAD_DIR = "uploads";

/** Vercel serverless has a read-only filesystem — store file bytes in PostgreSQL instead. */
export function useDatabaseFileStorage(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.UPLOAD_STORAGE === "database"
  );
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const CATEGORY_LIMITS: Record<
  UploadCategory,
  { maxFiles: number; maxSize: number; accept: string }
> = {
  pdf: {
    maxFiles: 20,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: ".pdf,application/pdf",
  },
  image: {
    maxFiles: 50,
    maxSize: 10 * 1024 * 1024, // 10 MB per image
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
  },
  excel: {
    maxFiles: 10,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept:
      ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv",
  },
  word: {
    maxFiles: 10,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept:
      ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  any: {
    maxFiles: 20,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: "*",
  },
};

export const ALLOWED_MIME_TYPES: Record<UploadCategory, string[]> = {
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/webp"],
  excel: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ],
  word: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  any: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
};

export const ALLOWED_EXTENSIONS: Record<UploadCategory, string[]> = {
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".webp"],
  excel: [".xlsx", ".xls", ".csv"],
  word: [".docx"],
  any: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
};

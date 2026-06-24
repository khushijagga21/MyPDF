import type { UploadCategory } from "@/lib/upload/types";

export const UPLOAD_DIR = "uploads";

/** Uploaded files expire after 24 hours (keeps database storage healthy). */
export const FILE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Production uses PostgreSQL for file bytes (works on Vercel, Railway, Render).
 * Local dev uses the uploads/ folder unless UPLOAD_STORAGE=database.
 */
export function useDatabaseFileStorage(): boolean {
  if (process.env.UPLOAD_STORAGE === "filesystem") return false;
  if (process.env.UPLOAD_STORAGE === "database") return true;
  if (process.env.NODE_ENV !== "production") return false;
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
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

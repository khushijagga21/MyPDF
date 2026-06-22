import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  CATEGORY_LIMITS,
} from "@/lib/upload/config";
import type { UploadCategory, UploadError, ValidationResult } from "@/lib/upload/types";

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function validateFile(
  file: { name: string; size: number; type: string },
  category: UploadCategory = "pdf"
): ValidationResult {
  const errors: UploadError[] = [];
  const limits = CATEGORY_LIMITS[category];
  const ext = getExtension(file.name);
  const allowedMimes = ALLOWED_MIME_TYPES[category];
  const allowedExts = ALLOWED_EXTENSIONS[category];

  if (file.size === 0) {
    errors.push({ code: "EMPTY_FILE", message: `"${file.name}" is empty.` });
  }

  if (file.size > limits.maxSize) {
    const maxMb = (limits.maxSize / (1024 * 1024)).toFixed(0);
    errors.push({
      code: "FILE_TOO_LARGE",
      message: `"${file.name}" exceeds the ${maxMb} MB limit.`,
    });
  }

  const mimeOk =
    category === "any" ||
    allowedMimes.includes(file.type) ||
    file.type === "application/octet-stream";
  const extOk = category === "any" || allowedExts.includes(ext);

  if (!mimeOk && !extOk) {
    errors.push({
      code: "INVALID_TYPE",
      message: `"${file.name}" is not an allowed file type.`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateFileBatch(
  files: { name: string; size: number; type: string }[],
  category: UploadCategory,
  existingCount = 0
): ValidationResult {
  const errors: UploadError[] = [];
  const limits = CATEGORY_LIMITS[category];

  if (existingCount + files.length > limits.maxFiles) {
    errors.push({
      code: "TOO_MANY_FILES",
      message: `Maximum ${limits.maxFiles} files allowed.`,
    });
  }

  for (const file of files) {
    const result = validateFile(file, category);
    errors.push(...result.errors);
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

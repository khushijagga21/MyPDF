export type UploadCategory = "pdf" | "image" | "excel" | "word" | "any";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadedFileRecord {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  category: UploadCategory;
  createdAt: string;
  url: string;
  userId?: string | null;
}

export interface UploadItem {
  clientId: string;
  serverId?: string;
  name: string;
  size: number;
  mimeType: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  record?: UploadedFileRecord;
  /** Local File kept for client-side PDF processing */
  localFile?: File;
  previewUrl?: string;
}

export interface UploadError {
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: UploadError[];
}

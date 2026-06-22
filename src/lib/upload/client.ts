import type { UploadCategory, UploadedFileRecord } from "@/lib/upload/types";

export function uploadFileToServer(
  file: File,
  category: UploadCategory,
  onProgress: (percent: number) => void
): Promise<UploadedFileRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const record = JSON.parse(xhr.responseText) as UploadedFileRecord;
          resolve(record);
        } catch {
          reject(new Error("Invalid server response."));
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(body.error ?? `Upload failed (${xhr.status}).`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status}).`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled."));
    });

    xhr.open("POST", `/api/upload?category=${category}`);
    xhr.send(formData);
  });
}

export async function deleteUploadedFileFromServer(id: string): Promise<void> {
  const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to delete file.");
  }
}

export async function fetchUploadedFileAsBlob(id: string): Promise<Blob> {
  const res = await fetch(`/api/upload/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch uploaded file.");
  }
  return res.blob();
}

export async function fetchUploadedFileAsFile(
  id: string,
  name: string,
  mimeType: string
): Promise<File> {
  const blob = await fetchUploadedFileAsBlob(id);
  return new File([blob], name, { type: mimeType });
}

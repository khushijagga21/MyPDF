import type {
  MergePdfRequest,
  MergePdfErrorResponse,
  SplitPdfFilePayload,
  SplitPdfRequest,
  SplitPdfErrorResponse,
  RemovePdfPagesFilePayload,
  RemovePdfPagesRequest,
  EditPdfFilePayload,
  EditPdfRequest,
  PdfToPowerpointRequest,
} from "@/lib/pdf/types";

async function parseApiError(
  response: Response,
  fallback: string
): Promise<string> {
  let message = fallback;
  try {
    const body = (await response.json()) as MergePdfErrorResponse;
    if (body.error) message = body.error;
  } catch {
    // response may not be JSON
  }
  return message;
}

export async function mergePdfsViaApi(request: MergePdfRequest): Promise<Blob> {
  const response = await fetch("/api/merge-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Merge failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function mergePdfsFromLocalFiles(files: File[]): Promise<Blob> {
  const formData = new FormData();
  formData.append("mode", "files");
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch("/api/merge-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Merge failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function mergePdfsFromLocalPages(
  files: File[],
  pages: Array<{ fileIndex: number; pageIndex: number }>
): Promise<Blob> {
  const formData = new FormData();
  formData.append("mode", "pages");
  formData.append("payload", JSON.stringify({ pages }));
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch("/api/merge-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Merge failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function splitPdfViaApi(request: SplitPdfRequest): Promise<Blob> {
  const response = await fetch("/api/split-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(
        response as Response & { json(): Promise<SplitPdfErrorResponse> },
        `Split failed (${response.status}).`
      )
    );
  }

  return response.blob();
}

export async function splitPdfViaFile(
  file: File,
  request: SplitPdfFilePayload
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("payload", JSON.stringify(request));

  const response = await fetch("/api/split-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Split failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function removePdfPagesViaApi(
  request: RemovePdfPagesRequest
): Promise<Blob> {
  const response = await fetch("/api/remove-pdf-pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Remove pages failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function removePdfPagesViaFile(
  file: File,
  request: RemovePdfPagesFilePayload
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("payload", JSON.stringify(request));

  const response = await fetch("/api/remove-pdf-pages", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Remove pages failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function editPdfViaApi(request: EditPdfRequest): Promise<Blob> {
  const response = await fetch("/api/edit-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Edit failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function editPdfViaFile(
  file: File,
  request: EditPdfFilePayload
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("payload", JSON.stringify(request));

  const response = await fetch("/api/edit-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(response, `Edit failed (${response.status}).`)
    );
  }

  return response.blob();
}

export async function pdfToPowerpointViaApi(
  request: PdfToPowerpointRequest
): Promise<Blob> {
  const response = await fetch("/api/pdf-to-powerpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await parseApiError(
        response,
        `PowerPoint conversion failed (${response.status}).`
      )
    );
  }

  return response.blob();
}

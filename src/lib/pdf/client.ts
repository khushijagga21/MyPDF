import type {
  MergePdfRequest,
  MergePdfErrorResponse,
  SplitPdfRequest,
  SplitPdfErrorResponse,
  RemovePdfPagesRequest,
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

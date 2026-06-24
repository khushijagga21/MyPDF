async function readConversionError(response: Response): Promise<string> {
  let message = `Conversion failed (${response.status}).`;
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) message = body.error;
  } catch {
    // ignore
  }
  return message;
}

export async function pdfToWordViaFile(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/pdf-to-word", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readConversionError(response));
  }

  return response.blob();
}

export async function pdfToWordViaApi(fileId: string): Promise<Blob> {
  const response = await fetch("/api/pdf-to-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId }),
  });

  if (!response.ok) {
    throw new Error(await readConversionError(response));
  }

  return response.blob();
}

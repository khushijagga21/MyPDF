import { randomUUID } from "crypto";
import { getSessionUserId } from "@/lib/auth/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { persistFileRecord } from "@/lib/db/files";
import { sanitizeFileName } from "@/lib/upload/validation";
import type { UploadCategory } from "@/lib/upload/types";

export interface ToolFileInput {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  category?: UploadCategory;
}

export interface SaveToolArtifactsInput {
  tool: string;
  output: ToolFileInput & { mimeType: string };
  input?: ToolFileInput;
  inputs?: ToolFileInput[];
  inputFileIds?: string[];
}

async function saveBufferAsStoredFile(
  userId: string,
  buffer: Buffer,
  meta: {
    originalName: string;
    mimeType: string;
    category: UploadCategory;
    role: "upload" | "output";
  }
): Promise<string> {
  const id = randomUUID();
  const safeName = sanitizeFileName(meta.originalName);
  const now = new Date().toISOString();

  await persistFileRecord(
    {
      id,
      originalName: meta.originalName,
      storedName: `${id}-${safeName}`,
      mimeType: meta.mimeType,
      size: buffer.length,
      category: meta.category,
      createdAt: now,
      url: `/api/upload/${id}`,
      userId,
    },
    userId,
    buffer
  );

  await prisma.storedFile.update({
    where: { id },
    data: { role: meta.role },
  });

  return id;
}

function inferCategory(mimeType: string, fileName: string): UploadCategory {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (
    mimeType.startsWith("image/") ||
    /\.(jpe?g|png|webp)$/i.test(fileName)
  ) {
    return "image";
  }
  return "any";
}

/** Persist tool input/output files and link them in history for the Profile page. */
export async function saveToolArtifacts(
  input: SaveToolArtifactsInput
): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId || !isDatabaseConfigured()) return;

  const inputIds: string[] = [...(input.inputFileIds ?? [])];

  if (input.input && inputIds.length === 0) {
    const id = await saveBufferAsStoredFile(userId, input.input.buffer, {
      originalName: input.input.fileName,
      mimeType: input.input.mimeType ?? "application/pdf",
      category: input.input.category ?? inferCategory("", input.input.fileName),
      role: "upload",
    });
    inputIds.push(id);
  }

  if (input.inputs?.length && inputIds.length === 0) {
    for (const file of input.inputs) {
      const id = await saveBufferAsStoredFile(userId, file.buffer, {
        originalName: file.fileName,
        mimeType: file.mimeType ?? "application/pdf",
        category: file.category ?? inferCategory("", file.fileName),
        role: "upload",
      });
      inputIds.push(id);
    }
  }

  const outputId = await saveBufferAsStoredFile(userId, input.output.buffer, {
    originalName: input.output.fileName,
    mimeType: input.output.mimeType,
    category: input.output.category ?? inferCategory(input.output.mimeType, input.output.fileName),
    role: "output",
  });

  await prisma.fileHistory.create({
    data: {
      userId,
      tool: input.tool,
      storedFileId: inputIds[0] ?? null,
      outputStoredFileId: outputId,
      inputFileIds: JSON.stringify(inputIds),
      outputFileName: input.output.fileName,
      outputSize: input.output.buffer.length,
      status: "completed",
    },
  });
}

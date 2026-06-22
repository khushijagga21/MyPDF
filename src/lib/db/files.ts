import type { UploadCategory, UploadedFileRecord } from "@/lib/upload/types";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function persistFileRecord(
  record: UploadedFileRecord,
  userId?: string | null
): Promise<void> {
  if (!isDatabaseConfigured()) return;

  await prisma.storedFile.upsert({
    where: { id: record.id },
    create: {
      id: record.id,
      userId: userId ?? null,
      originalName: record.originalName,
      storedName: record.storedName,
      mimeType: record.mimeType,
      size: record.size,
      category: record.category,
      createdAt: new Date(record.createdAt),
    },
    update: {
      userId: userId ?? undefined,
    },
  });
}

export async function removeFileRecord(id: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await prisma.storedFile.deleteMany({ where: { id } });
}

export async function getFileOwnerId(id: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const file = await prisma.storedFile.findUnique({
    where: { id },
    select: { userId: true },
  });
  return file?.userId ?? null;
}

export async function canAccessFile(
  fileId: string,
  userId?: string | null
): Promise<boolean> {
  if (!isDatabaseConfigured()) return true;

  const ownerId = await getFileOwnerId(fileId);
  if (!ownerId) return true;
  if (!userId) return false;
  return ownerId === userId;
}

export interface LogHistoryInput {
  userId?: string | null;
  tool: string;
  inputFileIds: string[];
  storedFileId?: string | null;
  outputFileName?: string | null;
  outputSize?: number | null;
  status?: "completed" | "failed" | "pending";
  errorMessage?: string | null;
}

export async function logFileHistory(input: LogHistoryInput): Promise<void> {
  if (!isDatabaseConfigured()) return;

  await prisma.fileHistory.create({
    data: {
      userId: input.userId ?? null,
      storedFileId: input.storedFileId ?? null,
      tool: input.tool,
      inputFileIds: JSON.stringify(input.inputFileIds),
      outputFileName: input.outputFileName ?? null,
      outputSize: input.outputSize ?? null,
      status: input.status ?? "completed",
      errorMessage: input.errorMessage ?? null,
    },
  });
}

export async function getUserFiles(userId: string) {
  if (!isDatabaseConfigured()) return [];
  return prisma.storedFile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getUserHistory(userId: string) {
  if (!isDatabaseConfigured()) return [];
  return prisma.fileHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      storedFile: {
        select: { id: true, originalName: true, mimeType: true, size: true },
      },
    },
  });
}

export function recordFromDb(file: {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: Date;
  userId: string | null;
}): UploadedFileRecord {
  return {
    id: file.id,
    originalName: file.originalName,
    storedName: file.storedName,
    mimeType: file.mimeType,
    size: file.size,
    category: file.category as UploadCategory,
    createdAt: file.createdAt.toISOString(),
    url: `/api/upload/${file.id}`,
    userId: file.userId,
  };
}

export function parseInputFileIds(value: unknown): string[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === "string");
      }
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

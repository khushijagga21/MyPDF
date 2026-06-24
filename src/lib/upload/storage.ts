import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR, useDatabaseFileStorage } from "@/lib/upload/config";
import type { UploadedFileRecord } from "@/lib/upload/types";
import {
  getFileOwnerId,
  persistFileRecord,
  readFileDataFromDb,
  recordFromDb,
  removeFileRecord,
} from "@/lib/db/files";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const UPLOADS_PATH = path.join(process.cwd(), UPLOAD_DIR);
const META_DIR = path.join(UPLOADS_PATH, "_meta");

export function getUploadsPath(): string {
  return UPLOADS_PATH;
}

export async function ensureUploadDirs(): Promise<void> {
  if (useDatabaseFileStorage()) return;
  await fs.mkdir(UPLOADS_PATH, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });
}

function metaPath(id: string): string {
  return path.join(META_DIR, `${id}.json`);
}

function filePath(storedName: string): string {
  return path.join(UPLOADS_PATH, storedName);
}

export async function saveUploadedFile(
  id: string,
  buffer: Buffer,
  record: UploadedFileRecord,
  userId?: string | null
): Promise<void> {
  if (useDatabaseFileStorage()) {
    if (!isDatabaseConfigured()) {
      throw new Error("Database is not configured for file storage.");
    }
    await persistFileRecord({ ...record, userId: userId ?? null }, userId, buffer);
    return;
  }

  await ensureUploadDirs();
  await fs.writeFile(filePath(record.storedName), buffer);
  await fs.writeFile(metaPath(id), JSON.stringify(record, null, 2), "utf-8");
  await persistFileRecord({ ...record, userId: userId ?? null }, userId);
}

export async function getUploadedFileMeta(
  id: string
): Promise<UploadedFileRecord | null> {
  if (isDatabaseConfigured()) {
    try {
      const file = await prisma.storedFile.findUnique({ where: { id } });
      if (file) return recordFromDb(file);
    } catch {
      // fall through to filesystem
    }
  }

  if (useDatabaseFileStorage()) return null;

  try {
    const raw = await fs.readFile(metaPath(id), "utf-8");
    return JSON.parse(raw) as UploadedFileRecord;
  } catch {
    return null;
  }
}

export async function readUploadedFileBuffer(id: string): Promise<{
  meta: UploadedFileRecord;
  buffer: Buffer;
} | null> {
  const meta = await getUploadedFileMeta(id);
  if (!meta) return null;

  if (useDatabaseFileStorage()) {
    const buffer = await readFileDataFromDb(id);
    if (!buffer) return null;
    return { meta, buffer };
  }

  try {
    const buffer = await fs.readFile(filePath(meta.storedName));
    return { meta, buffer };
  } catch {
    const buffer = await readFileDataFromDb(id);
    if (!buffer) return null;
    return { meta, buffer };
  }
}

export async function deleteUploadedFile(id: string): Promise<boolean> {
  const meta = await getUploadedFileMeta(id);
  if (!meta) return false;

  if (!useDatabaseFileStorage()) {
    try {
      await fs.unlink(filePath(meta.storedName));
    } catch {
      // file may already be gone
    }
    try {
      await fs.unlink(metaPath(id));
    } catch {
      // meta may already be gone
    }
  }

  await removeFileRecord(id);
  return true;
}

export { getFileOwnerId };

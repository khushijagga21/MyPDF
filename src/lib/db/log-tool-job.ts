import { getSessionUserId } from "@/lib/auth/session";
import { logFileHistory, type LogHistoryInput } from "@/lib/db/files";

export async function logToolJob(
  input: Omit<LogHistoryInput, "userId">
): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  await logFileHistory({ ...input, userId });
}

"use client";

import { usePrefetchTools } from "@/hooks/use-prefetch-tools";

export function AppProviders({ children }: { children: React.ReactNode }) {
  usePrefetchTools();
  return <>{children}</>;
}

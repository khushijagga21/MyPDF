"use client";

import { usePrefetchTools } from "@/hooks/use-prefetch-tools";
import { AuthProvider } from "@/components/providers/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  usePrefetchTools();
  return <AuthProvider>{children}</AuthProvider>;
}

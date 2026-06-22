"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { availableTools } from "@/lib/data/tools";

/** Warm tool route JS chunks in the background after idle */
export function usePrefetchTools() {
  const router = useRouter();

  useEffect(() => {
    const prefetch = () => {
      for (const tool of availableTools) {
        router.prefetch(tool.href);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(prefetch, 1500);
    return () => clearTimeout(timer);
  }, [router]);
}

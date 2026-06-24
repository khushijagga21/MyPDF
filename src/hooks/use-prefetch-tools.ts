"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POPULAR_TOOL_ROUTES = ["/merge", "/compress", "/split", "/pdf-to-word"];

/** Warm only the most-used tool routes — prefetching everything slows the app */
export function usePrefetchTools() {
  const router = useRouter();

  useEffect(() => {
    const prefetch = () => {
      for (const href of POPULAR_TOOL_ROUTES) {
        router.prefetch(href);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(prefetch, 3000);
    return () => clearTimeout(timer);
  }, [router]);
}

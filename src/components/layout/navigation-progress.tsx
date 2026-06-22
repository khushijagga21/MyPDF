"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setVisible(true);
        }
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  return (
    <div
      role="progressbar"
      aria-hidden={!visible}
      aria-label="Loading page"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full w-1/3 bg-gradient-to-r from-violet-600 to-indigo-600",
          visible && "animate-[navigation-progress_1s_ease-in-out_infinite]"
        )}
      />
    </div>
  );
}

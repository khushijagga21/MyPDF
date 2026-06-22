import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared focus ring for interactive elements outside Button/Input */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Shared nav link styles */
export function navLinkClass(active: boolean) {
  return cn(
    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
    focusRing,
    active
      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
      : "text-muted-foreground hover:bg-white/10 hover:text-foreground dark:hover:bg-white/5"
  );
}

/** Section vertical padding — consistent across pages */
export const sectionPadding = "py-16 sm:py-20";

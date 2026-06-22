"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { availableTools } from "@/lib/data/tools";
import { getToolIcon } from "@/lib/data/tool-icons";
import { cn, focusRing } from "@/lib/utils";

interface ToolsDropdownProps {
  onNavigate?: () => void;
  className?: string;
}

export function ToolsDropdown({ onNavigate, className }: ToolsDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = availableTools.some((t) => pathname === t.href);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
          focusRing,
          isActive
            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
            : "text-muted-foreground hover:bg-white/10 hover:text-foreground dark:hover:bg-white/5"
        )}
      >
        Tools
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/20 bg-surface-elevated p-2 shadow-2xl backdrop-blur-xl"
        >
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            PDF Tools
          </p>
          {availableTools.map((tool) => {
            const Icon = getToolIcon(tool.icon);
            return (
              <Link
                key={tool.id}
                href={tool.href}
                prefetch
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-violet-500/10",
                  focusRing,
                  pathname === tool.href && "bg-violet-500/10"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                    tool.color
                  )}
                >
                  <Icon className="h-4 w-4 text-white" aria-hidden />
                </div>
                <span className="text-sm font-medium">{tool.name}</span>
              </Link>
            );
          })}
          <div className="mt-1 border-t border-white/10 pt-1">
            <Link
              href="/#tools"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={cn(
                "block rounded-xl px-3 py-2 text-xs text-violet-500 hover:bg-violet-500/10 font-medium",
                focusRing
              )}
            >
              View all tools →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { getToolIcon } from "@/lib/data/tool-icons";
import type { Tool } from "@/lib/data/tools";
import { cn, focusRing } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
  index?: number;
  comingSoon?: boolean;
}

export function ToolCard({ tool, index = 0, comingSoon = false }: ToolCardProps) {
  const router = useRouter();
  const Icon = getToolIcon(tool.icon);
  const shouldReduceMotion = useReducedMotion();
  const isUnavailable = comingSoon || !tool.available;

  const card = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300",
        !isUnavailable &&
          "hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 focus-visible:-translate-y-1",
        isUnavailable && "opacity-70"
      )}
    >
      {isUnavailable && (
        <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      )}
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform",
          !isUnavailable && "group-hover:scale-110 group-focus-visible:scale-110",
          tool.color
        )}
      >
        <Icon className="h-6 w-6 text-white" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold mb-1.5 flex items-center gap-1">
        {tool.name}
        {!isUnavailable && (
          <ArrowUpRight
            className="h-4 w-4 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:translate-x-0"
            aria-hidden
          />
        )}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {tool.description}
      </p>
      {!isUnavailable && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 group-focus-visible:from-violet-500/5 group-focus-visible:to-indigo-500/5 transition-all duration-300 rounded-2xl pointer-events-none" />
      )}
    </div>
  );

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {isUnavailable ? (
        <div className="block h-full rounded-2xl" aria-disabled="true">
          {card}
        </div>
      ) : (
        <Link
          href={tool.href}
          prefetch
          onMouseEnter={() => router.prefetch(tool.href)}
          onFocus={() => router.prefetch(tool.href)}
          className={cn("group block h-full rounded-2xl", focusRing)}
        >
          {card}
        </Link>
      )}
    </motion.div>
  );
}

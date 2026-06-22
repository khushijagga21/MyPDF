"use client";

import { motion, useReducedMotion } from "framer-motion";
import { toolIcons } from "@/lib/data/tool-icons";
import type { ToolIconKey } from "@/lib/data/tool-icons";
import { Badge } from "@/components/ui/badge";

export type { ToolIconKey };

interface ToolPageLayoutProps {
  title: string;
  description: string;
  icon: ToolIconKey;
  iconColor: string;
  children: React.ReactNode;
}

export function ToolPageLayout({
  title,
  description,
  icon,
  iconColor,
  children,
}: ToolPageLayoutProps) {
  const Icon = toolIcons[icon];
  const shouldReduceMotion = useReducedMotion();

  const fadeIn = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2 },
      };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div {...fadeIn} className="text-center mb-8 sm:mb-10">
        <div
          className={`inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${iconColor} shadow-xl mb-5`}
        >
          <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
        </div>
        <Badge variant="secondary" className="mb-3">
          Free · Browser-based · Private
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          {description}
        </p>
      </motion.div>

      <div>{children}</div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Your files are processed securely and stored temporarily during editing.
      </p>
    </div>
  );
}

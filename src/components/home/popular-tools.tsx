"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/tools/tool-card";
import { popularTools } from "@/lib/data/tools";
import { Button } from "@/components/ui/button";

import { sectionPadding } from "@/lib/utils";

export function PopularTools() {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <p className="text-sm font-medium text-violet-500 mb-2">Most used</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Popular tools
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg">
            The tools our users reach for every day
          </p>
        </div>
        <Button variant="ghost" asChild className="shrink-0">
          <Link href="#tools">
            View all tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {popularTools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </section>
  );
}

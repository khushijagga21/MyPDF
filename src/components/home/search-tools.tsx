"use client";

import { useState, useMemo, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ToolCard } from "@/components/tools/tool-card";
import { availableTools, tools } from "@/lib/data/tools";
import { sectionPadding } from "@/lib/utils";

const comingSoonTools = tools.filter((t) => !t.available);

export function SearchTools() {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const shouldReduceMotion = useReducedMotion();

  const filteredTools = useMemo(() => {
    if (!query.trim()) return availableTools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.includes(q)
    );
  }, [query]);

  const showComingSoon = !query.trim() && comingSoonTools.length > 0;

  return (
    <section id="tools" className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
          Find your tool
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-6 sm:mb-8">
          Search through our complete suite of PDF utilities
        </p>
        <div className="relative max-w-lg mx-auto text-left">
          <Label htmlFor={searchId} className="sr-only">
            Search PDF tools
          </Label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            id={searchId}
            type="search"
            placeholder="Search tools... e.g. merge, compress, convert"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-base"
            aria-describedby="search-results-count"
          />
        </div>
      </motion.div>

      <p id="search-results-count" className="sr-only" aria-live="polite">
        {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
      </p>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tools found"
          description={`No results for "${query}". Try searching merge, split, compress, or convert.`}
        />
      )}

      {showComingSoon && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-1">Coming soon</h3>
          <p className="text-sm text-muted-foreground mb-5">
            These tools are on our roadmap
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} comingSoon />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

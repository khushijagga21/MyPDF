"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Globe, Layers, Lock, Palette } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { sectionPadding } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All processing happens in your browser. Your documents never touch our servers.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "No upload wait times. Process files instantly with optimized client-side engines.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      `Use ${BRAND_NAME} on any device — desktop, tablet, or mobile. No installs needed.`,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description:
      "Handle multiple files at once with Pro. Merge, convert, or compress in bulk.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description:
      "End-to-end local processing means your sensitive documents stay confidential.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Palette,
    title: "Beautiful Interface",
    description:
      "A thoughtfully crafted experience that makes document work feel enjoyable.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

export function FeatureHighlights() {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-sm font-medium text-violet-500 mb-2">Why {BRAND_NAME}</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Built different
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          We reimagined PDF tools from the ground up with privacy, speed, and design at the core
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 sm:p-8 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
            >
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

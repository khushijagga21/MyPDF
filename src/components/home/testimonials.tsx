"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { testimonials } from "@/lib/data/testimonials";

import { sectionPadding } from "@/lib/utils";

export function Testimonials() {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-sm font-medium text-violet-500 mb-2">Testimonials</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Loved by thousands
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          See what professionals and creatives say about {BRAND_NAME}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8"
          >
            <Quote className="absolute top-6 right-6 h-8 w-8 text-violet-500/10" aria-hidden />
            <div
              className="flex gap-1 mb-4"
              role="img"
              aria-label={`${testimonial.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                  aria-hidden
                />
              ))}
            </div>
            <p className="text-foreground leading-relaxed mb-6">
              &ldquo;{testimonial.content}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white"
                aria-hidden
              >
                {testimonial.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role} · {testimonial.company}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

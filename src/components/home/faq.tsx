"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND_NAME } from "@/lib/brand";
import { faqItems } from "@/lib/data/faq";

import { sectionPadding } from "@/lib/utils";

export function FAQ() {
  return (
    <section className={`mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-violet-500 mb-2">FAQ</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Common questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about {BRAND_NAME}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-6 sm:px-8"
      >
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}

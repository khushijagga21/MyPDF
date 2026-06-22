"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { pricingPlans } from "@/lib/data/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, sectionPadding } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge variant="secondary" className="mb-4">
          Simple pricing
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Choose your plan
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start free and upgrade when you need more power. No hidden fees, cancel anytime.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto overflow-hidden">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex flex-col rounded-2xl border backdrop-blur-xl p-6 sm:p-8",
              plan.popular
                ? "border-violet-500/50 bg-white/60 dark:bg-white/10 shadow-2xl shadow-violet-500/10 md:scale-[1.02] md:z-10"
                : "border-white/20 bg-white/40 dark:bg-white/5"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge>Most Popular</Badge>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span className="text-muted-foreground text-sm"> /{plan.period}</span>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1" aria-label={`${plan.name} plan features`}>
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start gap-2.5 text-sm">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" aria-hidden />
                  )}
                  <span
                    className={cn(!feature.included && "text-muted-foreground/60")}
                  >
                    <span className="sr-only">{feature.included ? "Included: " : "Not included: "}</span>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "default" : "glass"}
              className="w-full"
              asChild
            >
              <Link href={plan.id === "team" ? "/contact" : "#"}>
                {plan.cta}
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground mt-12"
      >
        All plans include browser-based processing. Payment integration coming soon.
      </motion.p>
    </div>
  );
}

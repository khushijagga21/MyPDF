"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn, focusRing, sectionPadding } from "@/lib/utils";
import { BRAND_EMAIL } from "@/lib/brand";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: BRAND_EMAIL,
    href: `mailto:${BRAND_EMAIL}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "San Francisco, CA",
    href: "#",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-16"
      >
        <Badge variant="secondary" className="mb-4">
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Get in touch
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
          Contact us
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Have a question, feedback, or need help with a Team plan? We&apos;d love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4 sm:space-y-6"
        >
          {contactInfo.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-start gap-4 rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-5 transition-colors hover:border-violet-500/30",
                focusRing
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <item.icon className="h-5 w-5 text-violet-500" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            </a>
          ))}

          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 backdrop-blur-xl p-5 sm:p-6">
            <p className="font-semibold mb-1">Response time</p>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours on business days.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 sm:p-8"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center text-center py-10 sm:py-12"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <Send className="h-8 w-8 text-emerald-500" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Thanks for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Jane Doe" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" required disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your question or feedback..."
                  required
                  disabled={loading}
                />
              </div>
              <LoadingButton
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                loading={loading}
                loadingText="Sending..."
              >
                Send Message
                <Send className="h-4 w-4" aria-hidden />
              </LoadingButton>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

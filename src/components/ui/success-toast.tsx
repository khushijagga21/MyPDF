"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  className?: string;
}

export function SuccessToast({
  message,
  visible,
  onDismiss,
  duration = 5000,
  className,
}: SuccessToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-background/95 p-4 shadow-xl shadow-emerald-500/10 backdrop-blur-xl",
            className
          )}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Success
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

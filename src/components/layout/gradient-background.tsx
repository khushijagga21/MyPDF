"use client";

export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/50 to-cyan-50/30 dark:from-background dark:via-muted dark:to-background" />
      <div className="absolute -top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[100px] dark:bg-violet-600/10" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[80px] dark:bg-cyan-600/8" />
    </div>
  );
}

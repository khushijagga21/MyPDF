"use client";

import { cn, focusRing } from "@/lib/utils";

interface OptionItem {
  id: string;
  title: string;
  description: string;
  example?: string;
  badge?: string;
}

interface OptionSelectorProps {
  options: OptionItem[];
  value: string;
  onChange: (id: string) => void;
  columns?: 1 | 2 | 3;
  label?: string;
}

export function OptionSelector({
  options,
  value,
  onChange,
  columns = 3,
  label = "Options",
}: OptionSelectorProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-3", colClass[columns])}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "relative rounded-xl border p-4 text-left transition-all cursor-pointer",
            focusRing,
            value === option.id
              ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
              : "border-white/20 bg-white/30 dark:bg-white/5 hover:border-white/30 hover:bg-white/40 dark:hover:bg-white/10"
          )}
        >
          {option.badge && (
            <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              {option.badge}
            </span>
          )}
          <p className="font-semibold text-sm">{option.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {option.description}
          </p>
          {option.example && (
            <p className="text-xs font-medium text-violet-500 mt-2">{option.example}</p>
          )}
        </button>
      ))}
    </div>
  );
}

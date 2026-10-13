"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import {
  resolveTheme,
  useThemeStore,
  type ThemePreference,
} from "@/store/theme-store";
import { cn } from "@/lib/utils";

const OPTIONS: {
  id: ThemePreference;
  icon: typeof Sun;
}[] = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
];

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = mounted ? preference : "system";
  const resolved = mounted ? resolveTheme(preference) : "light";
  const TriggerIcon = resolved === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t("toggle")}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-stone-200 bg-white px-2 text-slate-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-slate-950 dark:text-amber-300 dark:hover:bg-stone-900"
      >
        <TriggerIcon className="h-3.5 w-3.5" />
        <span className="hidden text-xs font-semibold sm:inline">{t("toggle")}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("toggle")}
          className="absolute top-full right-0 z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-slate-950"
        >
          {OPTIONS.map(({ id, icon: Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setPreference(id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                  selected
                    ? "bg-amber-50 font-semibold text-slate-900 dark:bg-amber-950/40 dark:text-amber-200"
                    : "text-slate-600 hover:bg-stone-50 dark:text-slate-300 dark:hover:bg-stone-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t(id)}</span>
                {selected && (
                  <span className="text-[10px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

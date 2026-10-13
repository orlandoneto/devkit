"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SITE } from "@/lib/site";

type ToolShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  notice?: string;
};

export function ToolShell({
  eyebrow = SITE.name,
  title,
  description,
  children,
  notice,
}: ToolShellProps) {
  const t = useTranslations("Common");
  const resolvedNotice = notice ?? t("defaultNotice");

  return (
    <section className="w-full min-w-0 rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-slate-950">
      <div className="px-3 py-3 sm:px-4 sm:py-3.5">
        <p className="font-[family-name:var(--font-display)] text-[10px] font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-400">
          {eyebrow}
        </p>
        <h1 className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          {title}
        </h1>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
          {description}
        </p>
        {children}
        <p className="mt-2.5 text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
          <strong className="text-slate-700 dark:text-slate-300">
            {t("important")}:
          </strong>{" "}
          {resolvedNotice}
        </p>
      </div>
    </section>
  );
}

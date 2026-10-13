"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MATH_TOOLS } from "@/lib/math/nav";
import { cn } from "@/lib/utils";

export { MATH_TOOLS };

export function MathNav({ currentHref }: { currentHref: string }) {
  const t = useTranslations();

  return (
    <nav
      aria-label={t("Groups.matematica")}
      className="mt-3 flex flex-wrap gap-1.5"
    >
      {MATH_TOOLS.map((tool) => {
        const active = tool.href === currentHref;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
              active
                ? "border-slate-900 bg-slate-900 text-white dark:border-amber-500 dark:bg-amber-500 dark:text-slate-950"
                : "border-stone-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:bg-slate-950 dark:text-slate-300",
            )}
          >
            {t(tool.titleKey)}
          </Link>
        );
      })}
    </nav>
  );
}

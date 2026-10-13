"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ALL_TOOLS, type ToolLink } from "@/lib/tools";

export function RelatedTools({
  currentHref,
  prefer = [],
}: {
  currentHref: string;
  /** Hrefs que devem aparecer primeiro no “Veja também”. */
  prefer?: string[];
}) {
  const t = useTranslations();
  const others = ALL_TOOLS.filter((tool) => tool.href !== currentHref);
  const preferred = prefer
    .map((href) => others.find((tool) => tool.href === href))
    .filter((tool): tool is ToolLink => Boolean(tool));
  const rest = others.filter((tool) => !prefer.includes(tool.href));
  const ranked = [...preferred, ...rest].slice(0, 6);

  return (
    <section className="mt-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
        {t("Footer.related")}
      </h2>
      <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {ranked.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block rounded-lg border border-stone-200 bg-white px-3 py-2 transition hover:border-amber-300 hover:bg-amber-50/40 dark:border-stone-800 dark:bg-slate-950 dark:hover:border-amber-800"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {t(tool.titleKey)}
              </span>
              <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                {t(tool.descriptionKey)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

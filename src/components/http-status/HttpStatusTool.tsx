"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  HTTP_STATUS_CATEGORIES,
  categoryTone,
  filterHttpStatusCodes,
  type HttpStatusCategory,
  type HttpStatusLocale,
} from "@/lib/http-status/codes";

type Filter = HttpStatusCategory | "all";

function toStatusLocale(locale: string): HttpStatusLocale {
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("en")) return "en";
  return "pt";
}

export function HttpStatusTool() {
  const t = useTranslations("HttpStatus");
  const locale = useLocale();
  const statusLocale = toStatusLocale(locale);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("all");

  const items = useMemo(
    () => filterHttpStatusCodes(query, category),
    [query, category],
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("all") },
    ...HTTP_STATUS_CATEGORIES.map((c) => ({
      id: c.id,
      label: t(`categories.${c.id}`),
    })),
  ];

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-stone-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
          />
        </label>

        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCategory(f.id)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                category === f.id
                  ? "bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950"
                  : "border border-stone-200 text-slate-600 hover:bg-stone-50 dark:border-stone-700 dark:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400">
          {t("count", { count: items.length })}
        </p>

        <ul className="divide-y divide-stone-100 overflow-hidden rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
          {items.map((item) => (
            <li
              key={item.code}
              className="flex gap-3 px-3 py-2.5 sm:items-start sm:gap-4"
            >
              <span
                className={`inline-flex h-8 min-w-12 shrink-0 items-center justify-center rounded-md px-2 font-mono text-sm font-bold ${categoryTone(item.category)}`}
              >
                {item.code}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </p>
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.description[statusLocale]}
                </p>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              {t("empty")}
            </li>
          )}
        </ul>
      </div>
    </ToolShell>
  );
}

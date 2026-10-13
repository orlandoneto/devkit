"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import {
  findGroupIdForTool,
  getGroupIcon,
  getHomeShortcuts,
  getToolIcon,
} from "@/lib/home";
import { ALL_TOOLS, TOOL_GROUPS, type ToolLink } from "@/lib/tools";
import { useFavoritesStore } from "@/store/favorites-store";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | string;

export function HomeLauncher({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const t = useTranslations();
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const shortcuts = useMemo(() => getHomeShortcuts(), []);

  const favoriteTools = useMemo(
    () => ALL_TOOLS.filter((tool) => favorites.includes(tool.href)),
    [favorites],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_TOOLS.filter((tool) => {
      const groupId = findGroupIdForTool(tool.href);
      if (category !== "all" && groupId !== category) return false;
      if (!q) return true;
      const title = t(tool.titleKey).toLowerCase();
      const description = t(tool.descriptionKey).toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }, [category, query, t]);

  function onToggle(href: string, title: string) {
    const wasFav = favorites.includes(href);
    toggleFavorite(href);
    toast.success(
      wasFav ? t("Home.unfavorited", { title }) : t("Home.favorited", { title }),
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Home.searchPlaceholder")}
          className="h-12 w-full rounded-2xl border border-stone-200 bg-white pr-4 pl-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 dark:border-stone-700 dark:bg-slate-950 dark:text-white dark:focus:border-amber-500"
          aria-label={t("Home.searchPlaceholder")}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label={t("Home.allCategories")}
        />
        {TOOL_GROUPS.map((group) => {
          const Icon = getGroupIcon(group.id);
          return (
            <Chip
              key={group.id}
              active={category === group.id}
              onClick={() => setCategory(group.id)}
              label={t(group.labelKey)}
              icon={<Icon className="h-3.5 w-3.5" />}
            />
          );
        })}
      </div>

      {!query && category === "all" && (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {t("Home.shortcuts")}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {shortcuts.map((tool, index) => (
              <ShortcutTile key={tool.href} tool={tool} index={index} />
            ))}
          </div>
        </section>
      )}

      {favoriteTools.length > 0 && !query && (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
            ★ {t("Home.favoritesTitle")}
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTools.map((tool, index) => (
              <ToolTile
                key={`fav-${tool.href}`}
                tool={tool}
                favorited
                index={index}
                onToggleFavorite={() =>
                  onToggle(tool.href, t(tool.titleKey))
                }
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-slate-500 uppercase">
            {category === "all"
              ? t("Home.allTools")
              : t(TOOL_GROUPS.find((g) => g.id === category)?.labelKey ?? "Home.allTools")}
          </h2>
          <p className="text-xs text-slate-400">
            {t("Home.resultsCount", { count: filtered.length })}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            {t("Home.noResults")}
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool, index) => (
              <ToolTile
                key={tool.href}
                tool={tool}
                favorited={favorites.includes(tool.href)}
                index={index}
                onToggleFavorite={() =>
                  onToggle(tool.href, t(tool.titleKey))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
          : "bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ShortcutTile({ tool, index }: { tool: ToolLink; index: number }) {
  const t = useTranslations();
  const Icon = getToolIcon(tool.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Link
        href={tool.href}
        className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-stone-800 dark:bg-slate-950 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400 dark:bg-amber-500 dark:text-slate-950">
          <Icon className="h-5 w-5" />
        </span>
        <span className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
          {t(tool.titleKey)}
        </span>
      </Link>
    </motion.div>
  );
}

function ToolTile({
  tool,
  favorited,
  onToggleFavorite,
  index,
}: {
  tool: ToolLink;
  favorited: boolean;
  onToggleFavorite: () => void;
  index: number;
}) {
  const t = useTranslations();
  const Icon = getToolIcon(tool.id);
  const groupId = findGroupIdForTool(tool.href);
  const GroupIcon = groupId ? getGroupIcon(groupId) : Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.025, duration: 0.2 }}
      className="relative rounded-2xl border border-stone-200 bg-white transition hover:border-amber-300 hover:shadow-sm dark:border-stone-800 dark:bg-slate-950 dark:hover:border-amber-800"
    >
      <button
        type="button"
        title={favorited ? t("Nav.removeFavorite") : t("Nav.addFavorite")}
        aria-label={favorited ? t("Nav.removeFavorite") : t("Nav.addFavorite")}
        onClick={onToggleFavorite}
        className="absolute top-2.5 right-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-stone-100 hover:text-amber-500 dark:hover:bg-stone-900"
      >
        <Star
          className={cn("h-4 w-4", favorited && "fill-amber-400 text-amber-500")}
        />
      </button>

      <Link href={tool.href} className="flex gap-3 p-3.5 pr-10">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-700 dark:bg-stone-900 dark:text-amber-400">
          <GroupIcon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900 dark:text-white">
            {t(tool.titleKey)}
          </span>
          <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-slate-500">
            {t(tool.descriptionKey)}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

/** @deprecated use HomeLauncher */
export { HomeLauncher as HomeToolsCatalog };

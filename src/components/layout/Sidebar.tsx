"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Star } from "lucide-react";
import { InstitutionalNav } from "@/components/layout/InstitutionalNav";
import { Link, usePathname } from "@/i18n/navigation";
import { getGroupIcon, getToolIcon } from "@/lib/home";
import { ALL_TOOLS, TOOL_GROUPS } from "@/lib/tools";
import { useFavoritesStore } from "@/store/favorites-store";
import { cn } from "@/lib/utils";

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const favoriteTools = ALL_TOOLS.filter((tool) => {
    if (!favorites.includes(tool.href)) return false;
    if (!q) return true;
    return (
      t(tool.titleKey).toLowerCase().includes(q) ||
      t(tool.descriptionKey).toLowerCase().includes(q)
    );
  });

  const filteredGroups = TOOL_GROUPS.map((group) => ({
    ...group,
    tools: group.tools.filter((tool) => {
      if (!q) return true;
      return (
        t(tool.titleKey).toLowerCase().includes(q) ||
        t(tool.descriptionKey).toLowerCase().includes(q)
      );
    }),
  })).filter((group) => group.tools.length > 0);

  const hasResults = favoriteTools.length > 0 || filteredGroups.length > 0;

  return (
    <aside
      className={cn(
        "flex w-[272px] shrink-0 flex-col border-r border-stone-200/80 bg-gradient-to-b from-[#f7f5f0] to-white dark:border-stone-800 dark:from-slate-950 dark:to-slate-950",
        "fixed inset-y-0 left-0 z-50 mt-12 transform transition-transform lg:sticky lg:top-12 lg:z-0 lg:mt-0 lg:h-[calc(100vh-3rem)] lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Nav.searchPlaceholder")}
            aria-label={t("Nav.searchPlaceholder")}
            className="h-9 w-full rounded-xl border border-stone-200 bg-white pr-3 pl-8 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-slate-950 dark:text-white dark:focus:border-amber-500"
          />
        </div>

        {!hasResults && (
          <p className="px-2 py-6 text-center text-xs text-slate-500">
            {t("Nav.noSearchResults")}
          </p>
        )}

        {favoriteTools.length > 0 && (
          <div className="mb-5">
            <p className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              {t("Nav.favorites")}
            </p>
            <ul className="space-y-0.5">
              {favoriteTools.map((tool) => (
                <SidebarItem
                  key={`fav-${tool.href}`}
                  href={tool.href}
                  title={t(tool.titleKey)}
                  toolId={tool.id}
                  active={pathname === tool.href}
                  favorited
                  onToggleFavorite={() => toggleFavorite(tool.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        )}

        {filteredGroups.map((group) => {
          const GroupIcon = getGroupIcon(group.id);
          return (
            <div key={group.id} className="mb-5">
              <p className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                <GroupIcon className="h-3.5 w-3.5 text-slate-400" />
                {t(group.labelKey)}
              </p>
              <ul className="space-y-0.5">
                {group.tools.map((tool) => (
                  <SidebarItem
                    key={tool.href}
                    href={tool.href}
                    title={t(tool.titleKey)}
                    toolId={tool.id}
                    active={pathname === tool.href}
                    favorited={favorites.includes(tool.href)}
                    onToggleFavorite={() => toggleFavorite(tool.href)}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <InstitutionalNav
        onNavigate={onNavigate}
        className="flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-200 px-4 py-3 text-xs dark:border-stone-800"
        linkClassName="font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      />
    </aside>
  );
}

function SidebarItem({
  href,
  title,
  toolId,
  active,
  favorited,
  onToggleFavorite,
  onNavigate,
}: {
  href: string;
  title: string;
  toolId: string;
  active: boolean;
  favorited: boolean;
  onToggleFavorite: () => void;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Nav");
  const Icon = getToolIcon(toolId);

  return (
    <li className="group flex items-center gap-0.5">
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition",
          active
            ? "bg-slate-900 font-semibold text-white shadow-sm dark:bg-amber-500 dark:text-slate-950"
            : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-stone-900 dark:hover:text-white",
        )}
      >
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            active
              ? "bg-white/15 text-amber-300 dark:bg-slate-950/20 dark:text-slate-950"
              : "bg-white text-slate-500 shadow-sm dark:bg-stone-900 dark:text-slate-400",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{title}</span>
      </Link>
      <button
        type="button"
        title={favorited ? t("removeFavorite") : t("addFavorite")}
        aria-label={favorited ? t("removeFavorite") : t("addFavorite")}
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite();
        }}
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-amber-500 dark:hover:bg-stone-900",
          favorited
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus:opacity-100",
        )}
      >
        <Star
          className={cn(
            "h-3.5 w-3.5",
            favorited && "fill-amber-400 text-amber-500",
          )}
        />
      </button>
    </li>
  );
}

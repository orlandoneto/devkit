"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Box, ChevronDown, LayoutGrid, Menu, X } from "lucide-react";
import { AuthControls } from "@/components/auth/AuthControls";
import { InstitutionalNav } from "@/components/layout/InstitutionalNav";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { FEATURES } from "@/lib/features";
import { getGroupIcon, getToolIcon } from "@/lib/home";
import { SITE } from "@/lib/site";
import { TOOL_GROUPS } from "@/lib/tools";
import { cn } from "@/lib/utils";

const GROUP_ACCENT: Record<string, string> = {
  documentos: "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300",
  codigos: "text-slate-700 bg-stone-100 dark:bg-stone-900 dark:text-slate-200",
  internacional: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300",
  seguranca: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
  produtividade: "text-slate-500 bg-stone-100 dark:bg-stone-900 dark:text-slate-300",
  matematica: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
};

type SiteHeaderProps = {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  showSidebarToggle?: boolean;
};

export function SiteHeader({
  onToggleSidebar,
  sidebarOpen = false,
  showSidebarToggle = true,
}: SiteHeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isBlog = pathname.startsWith("/blog");
  const isContact = pathname === "/contato";
  const toolActive = TOOL_GROUPS.some((group) =>
    group.tools.some((tool) => pathname === tool.href),
  );

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fafaf8]/90 backdrop-blur-xl dark:border-stone-800 dark:bg-black/80">
      <div
        className="relative mx-auto flex h-12 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        ref={menuRef}
      >
        <div className="flex min-w-0 items-center gap-2">
          {showSidebarToggle && (
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-700 lg:hidden dark:border-stone-700 dark:bg-slate-950 dark:text-slate-200"
              aria-label={sidebarOpen ? t("Nav.closeMenu") : t("Nav.openMenu")}
              onClick={onToggleSidebar}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400 shadow-sm dark:bg-amber-500 dark:text-slate-950">
              <Box className="h-4 w-4" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-base">
              {SITE.name}
            </span>
          </Link>
        </div>

        <nav
          className="flex shrink-0 items-center justify-end gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 sm:gap-2"
          aria-label={t("Nav.tools")}
        >
          <button
            type="button"
            id="nav-trigger-tools"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-controls="nav-menu-tools"
            className={cn(
              "hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition sm:inline-flex",
              menuOpen || toolActive
                ? "bg-stone-100 text-slate-900 dark:bg-stone-900 dark:text-white"
                : "text-slate-600 hover:bg-stone-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-stone-900 dark:hover:text-white",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            {t("Nav.tools")}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-slate-400 transition",
                menuOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {/* Links sempre no HTML (mobile / crawlers) */}
          <ul className="sr-only">
            {TOOL_GROUPS.flatMap((group) =>
              group.tools.map((tool) => (
                <li key={`seo-${tool.href}`}>
                  <Link href={tool.href}>{t(tool.titleKey)}</Link>
                </li>
              )),
            )}
            <li>
              <Link href="/blog">{t("Nav.blog")}</Link>
            </li>
            <li>
              <Link href="/sobre">{t("Nav.about")}</Link>
            </li>
            <li>
              <Link href="/contato">{t("Nav.contact")}</Link>
            </li>
            <li>
              <Link href="/privacidade">{t("Nav.privacy")}</Link>
            </li>
            <li>
              <Link href="/termos">{t("Nav.terms")}</Link>
            </li>
          </ul>

          <Link
            href="/sobre"
            className={cn(
              "hidden rounded-md px-2 py-1.5 transition hover:bg-stone-100 hover:text-slate-900 sm:inline-flex dark:hover:bg-stone-900 dark:hover:text-white",
              pathname === "/sobre" &&
                "bg-amber-50 text-slate-900 dark:bg-amber-950/30 dark:text-white",
            )}
          >
            {t("Nav.about")}
          </Link>

          <Link
            href="/blog"
            className={cn(
              "hidden rounded-md px-2 py-1.5 transition hover:bg-stone-100 hover:text-slate-900 sm:inline-flex dark:hover:bg-stone-900 dark:hover:text-white",
              isBlog &&
                "bg-amber-50 text-slate-900 dark:bg-amber-950/30 dark:text-white",
            )}
          >
            {t("Nav.blog")}
          </Link>

          <Link
            href="/contato"
            className={cn(
              "hidden rounded-md px-2 py-1.5 transition hover:bg-stone-100 hover:text-slate-900 sm:inline-flex dark:hover:bg-stone-900 dark:hover:text-white",
              isContact &&
                "bg-amber-50 text-slate-900 dark:bg-amber-950/30 dark:text-white",
            )}
          >
            {t("Nav.contact")}
          </Link>

          <LocaleSwitcher />
          <ThemeToggle />

          {FEATURES.publicApi && (
            <NextLink
              href="/api/openapi"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
            >
              OpenAPI
            </NextLink>
          )}

          <AuthControls />
        </nav>

        <div
          id="nav-menu-tools"
          role="region"
          aria-labelledby="nav-trigger-tools"
          hidden={!menuOpen}
          className="absolute top-full right-4 left-4 z-50 mt-1.5 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg max-sm:hidden dark:border-stone-800 dark:bg-slate-950"
        >
          <div className="max-h-[min(70vh,32rem)] overflow-auto p-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOL_GROUPS.map((group) => {
                const GroupIcon = getGroupIcon(group.id);
                const accent =
                  GROUP_ACCENT[group.id] ??
                  "text-slate-500 bg-stone-100 dark:bg-stone-900";
                return (
                  <div key={group.id}>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-md",
                          accent,
                        )}
                      >
                        <GroupIcon className="h-3 w-3" aria-hidden />
                      </span>
                      {t(group.labelKey)}
                    </p>
                    <ul className="space-y-0.5">
                      {group.tools.map((tool) => {
                        const active = pathname === tool.href;
                        const ToolIcon = getToolIcon(tool.id);
                        return (
                          <li key={tool.href}>
                            <Link
                              href={tool.href}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-stone-50 dark:hover:bg-stone-900",
                                active &&
                                  "bg-amber-50 font-medium text-slate-900 dark:bg-amber-950/30 dark:text-white",
                              )}
                            >
                              <ToolIcon
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                aria-hidden
                              />
                              <span className="min-w-0 truncate">
                                {t(tool.titleKey)}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
            <InstitutionalNav
              className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-200 pt-3 text-xs font-medium dark:border-stone-800"
              linkClassName="text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

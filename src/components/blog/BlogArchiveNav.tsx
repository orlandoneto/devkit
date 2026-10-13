"use client";

import { useLocale, useTranslations } from "next-intl";
import { InstitutionalNav } from "@/components/layout/InstitutionalNav";
import { Link, usePathname } from "@/i18n/navigation";
import {
  formatPostDate,
  getPostsGroupedByMonth,
} from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

type Props = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function BlogArchiveNav({ mobileOpen = false, onNavigate }: Props) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const pathname = usePathname();
  const groups = getPostsGroupedByMonth(locale);

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-stone-200 bg-[#f7f5f0]/95 dark:border-stone-800 dark:bg-slate-950/95",
        "fixed inset-y-0 left-0 z-50 mt-12 transform transition-transform lg:sticky lg:top-12 lg:z-0 lg:mt-0 lg:h-[calc(100vh-3rem)] lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-5 px-2">
          <Link
            href="/blog"
            onClick={onNavigate}
            className={cn(
              "font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight transition",
              pathname === "/blog"
                ? "text-amber-800 dark:text-amber-400"
                : "text-slate-900 hover:text-amber-800 dark:text-white dark:hover:text-amber-300",
            )}
          >
            {t("title")}
          </Link>
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {t("archive")}
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.key} className="mb-5">
            <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {group.label}
            </p>
            <ul className="mt-2 space-y-0.5">
              {group.posts.map((post) => {
                const href = `/blog/${post.slug}`;
                const active = pathname === href;
                return (
                  <li key={post.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-lg px-2 py-2 transition",
                        active
                          ? "bg-amber-50 dark:bg-amber-950/40"
                          : "hover:bg-stone-100/80 dark:hover:bg-stone-900",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-[13px] leading-snug",
                          active
                            ? "font-semibold text-slate-900 dark:text-white"
                            : "font-medium text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {post.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {formatPostDate(post.publishedAt, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <InstitutionalNav
        onNavigate={onNavigate}
        className="flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-200 px-4 py-3 text-xs dark:border-stone-800"
        linkClassName="font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      />
    </aside>
  );
}

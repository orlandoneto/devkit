"use client";

import { useTranslations } from "next-intl";
import { InstitutionalNav } from "@/components/layout/InstitutionalNav";
import { Link } from "@/i18n/navigation";
import { PUBLIC_CONTACT_EMAIL, SITE } from "@/lib/site";
import { TOOL_GROUPS } from "@/lib/tools";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-black/40">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="max-w-sm">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
            {SITE.name}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t("Site.tagline")}. {t("Footer.blurb")}
          </p>
          <a
            href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
            className="mt-3 inline-block text-sm font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </div>

        <nav aria-label={t("Footer.nav")} className="flex flex-col gap-2 text-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {t("Footer.nav")}
          </p>
          <Link
            href="/"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {t("Nav.tools")}
          </Link>
          <Link
            href="/blog"
            className="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            {t("Nav.blog")}
          </Link>
        </nav>

        <nav aria-label={t("Footer.legal")} className="flex flex-col gap-2 text-sm">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {t("Footer.legal")}
          </p>
          <InstitutionalNav
            className="flex flex-col gap-2"
            linkClassName="font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          />
        </nav>

        <ul className="sr-only">
          {TOOL_GROUPS.flatMap((group) =>
            group.tools.map((tool) => (
              <li key={`footer-${tool.href}`}>
                <Link href={tool.href}>{t(tool.titleKey)}</Link>
              </li>
            )),
          )}
        </ul>
      </div>
      <div className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} {SITE.name}
      </div>
    </footer>
  );
}

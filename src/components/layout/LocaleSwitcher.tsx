"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

function FlagIcon({ locale }: { locale: AppLocale }) {
  if (locale === "pt") {
    return (
      <svg
        viewBox="0 0 20 14"
        className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10"
        aria-hidden
      >
        <rect width="20" height="14" fill="#009c3b" />
        <polygon points="10,1.5 18.2,7 10,12.5 1.8,7" fill="#ffdf00" />
        <circle cx="10" cy="7" r="3.1" fill="#002776" />
        <path
          d="M7.2 6.4c1.1-.7 2.5-.9 3.8-.5.4.1.8.3 1.1.5"
          fill="none"
          stroke="#fff"
          strokeWidth="0.7"
        />
      </svg>
    );
  }

  if (locale === "en") {
    return (
      <svg
        viewBox="0 0 20 14"
        className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10"
        aria-hidden
      >
        <rect width="20" height="14" fill="#b22234" />
        <rect y="1.08" width="20" height="1.08" fill="#fff" />
        <rect y="3.23" width="20" height="1.08" fill="#fff" />
        <rect y="5.38" width="20" height="1.08" fill="#fff" />
        <rect y="7.54" width="20" height="1.08" fill="#fff" />
        <rect y="9.69" width="20" height="1.08" fill="#fff" />
        <rect y="11.85" width="20" height="1.08" fill="#fff" />
        <rect width="8" height="7.54" fill="#3c3b6e" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 14"
      className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10"
      aria-hidden
    >
      <rect width="20" height="14" fill="#c60b1e" />
      <rect y="3.5" width="20" height="7" fill="#ffc400" />
      <rect x="2.2" y="5.2" width="3.2" height="3.6" fill="#c60b1e" opacity="0.9" />
    </svg>
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div role="group" aria-label={t("label")} className="inline-flex items-center gap-1">
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-label={t(code)}
            aria-current={active ? "true" : undefined}
            title={t(code)}
            onClick={() => {
              if (code === locale) return;
              router.replace(pathname, { locale: code });
            }}
            className={`inline-flex h-8 items-center justify-center rounded-md border px-1.5 transition ${
              active
                ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300 dark:border-amber-600 dark:bg-amber-950/30 dark:ring-amber-700"
                : "border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-slate-950 dark:hover:bg-stone-900"
            }`}
          >
            <FlagIcon locale={code} />
          </button>
        );
      })}
    </div>
  );
}

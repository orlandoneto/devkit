"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ITEMS = [
  { href: "/sobre", labelKey: "about" },
  { href: "/contato", labelKey: "contact" },
  { href: "/privacidade", labelKey: "privacy" },
  { href: "/termos", labelKey: "terms" },
] as const;

export function InstitutionalNav({
  className,
  linkClassName,
  onNavigate,
}: {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Nav");

  return (
    <ul className={className}>
      {ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={linkClassName}
          >
            {t(item.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

import type { Metadata } from "next";
import { absoluteUrl, defaultOgImage, getSiteUrl, SITE } from "@/lib/site";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  locale?: string;
  /** Canonical force (ex.: blog EN → URL PT). */
  canonicalPath?: string;
  /** Use full title as-is (no "| devKit" template). */
  absoluteTitle?: boolean;
  /** Override default Open Graph / Twitter image. */
  image?: { url: string; width?: number; height?: number; alt?: string };
};

export function localizedPath(path: string, locale: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function schemaLanguage(locale: string) {
  if (locale === "pt") return "pt-BR";
  if (locale === "es") return "es";
  return "en";
}

function asLocale(locale: string): AppLocale {
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : routing.defaultLocale;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
  locale = routing.defaultLocale,
  canonicalPath,
  absoluteTitle = false,
  image,
}: BuildMetadataInput): Metadata {
  const pagePath = localizedPath(path, locale);
  const canonical = canonicalPath ?? pagePath;
  const url = absoluteUrl(canonical);
  const fullTitle =
    absoluteTitle || title.includes(SITE.name)
      ? title
      : `${title} | ${SITE.name}`;
  const ogImage = image
    ? {
        url: image.url,
        width: image.width ?? 1200,
        height: image.height ?? 630,
        alt: image.alt ?? title,
      }
    : defaultOgImage();

  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, localizedPath(path, code)]),
  );

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [
      ...keywords,
      SITE.name.toLowerCase(),
      "online tools",
      "generator",
      "validator",
      "software testing",
      "synthetic data",
    ],
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": localizedPath(path, routing.defaultLocale),
      },
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale:
        locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
      ...(SITE.twitterHandle ? { creator: SITE.twitterHandle } : {}),
    },
    metadataBase: new URL(getSiteUrl()),
  };
}

export function websiteJsonLd(locale: string = routing.defaultLocale) {
  const lang = asLocale(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: getSiteUrl(),
    description: SITE.description,
    inLanguage: schemaLanguage(lang),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: getSiteUrl(),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: getSiteUrl(),
    description: SITE.description,
    logo: absoluteUrl("/opengraph-image"),
    sameAs: [] as string[],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl("/contato"),
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined,
      availableLanguage: ["Portuguese", "English", "Spanish"],
    },
  };
}

/** Menu principal — ajuda o Google a descobrir tools (sitelinks / navegação). */
export function siteNavigationJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: string = routing.defaultLocale,
) {
  const lang = asLocale(locale);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} — ${lang === "en" ? "navigation" : lang === "es" ? "navegación" : "navegação"}`,
    itemListElement: items.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(localizedPath(item.path, lang)),
    })),
  };
}

export function webAppJsonLd(input: {
  name: string;
  path: string;
  description: string;
  locale?: string;
}) {
  const locale = asLocale(input.locale ?? routing.defaultLocale);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    url: absoluteUrl(localizedPath(input.path, locale)),
    description: input.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: schemaLanguage(locale),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: getSiteUrl(),
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: string = routing.defaultLocale,
) {
  const lang = asLocale(locale);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizedPath(item.path, lang)),
    })),
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  path: string;
  steps: Array<{ name: string; text: string }>;
  locale?: string;
}) {
  const locale = asLocale(input.locale ?? routing.defaultLocale);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: absoluteUrl(localizedPath(input.path, locale)),
    inLanguage: schemaLanguage(locale),
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  image?: string;
  locale?: string;
}) {
  const locale = asLocale(input.locale ?? routing.defaultLocale);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(localizedPath(input.path, locale)),
    datePublished: input.publishedAt,
    dateModified: input.publishedAt,
    image: input.image ? [input.image] : undefined,
    inLanguage: schemaLanguage(locale),
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: getSiteUrl(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image"),
      },
    },
    isAccessibleForFree: true,
  };
}

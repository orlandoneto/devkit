import { setRequestLocale, getTranslations } from "next-intl/server";
import { RichText } from "@/components/legal/RichText";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  buildMetadata,
  localizedPath,
  schemaLanguage,
} from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";

type LegalNamespace = "About" | "Privacy" | "Terms";

type Props = {
  params: Promise<{ locale: string }>;
  namespace: LegalNamespace;
  path: string;
  schemaType: "AboutPage" | "WebPage";
  sectionCount: number;
};

export async function generateLegalMetadata({
  params,
  namespace,
  path,
}: Pick<Props, "params" | "namespace" | "path">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path,
    locale,
    keywords: t("keywords")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
}

export async function LegalPage({
  params,
  namespace,
  path,
  schemaType,
  sectionCount,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace });
  const sections = Array.from({ length: sectionCount }, (_, i) => i + 1);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: SITE.name, path: "/" },
              { name: t("title"), path },
            ],
            locale,
          ),
          {
            "@context": "https://schema.org",
            "@type": schemaType,
            name: t("title"),
            description: t("metaDescription"),
            url: absoluteUrl(localizedPath(path, locale)),
            inLanguage: schemaLanguage(locale),
            isPartOf: {
              "@type": "WebSite",
              name: SITE.name,
              url: absoluteUrl("/"),
            },
            dateModified: t("updated"),
          },
        ]}
      />

      <header className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("intro")}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t("updatedLabel")}: {t("updated")}
        </p>
      </header>

      <div className="mt-10 max-w-2xl space-y-8">
        {sections.map((n) => (
          <section key={n} className="space-y-2">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
              {t(`sections.s${n}.heading`)}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <RichText text={t(`sections.s${n}.body`)} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

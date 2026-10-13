import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { CrossToolLink } from "@/components/seo/SeoSections";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CodigoBarras" });
  return buildMetadata({
    title: t("title"),
    description: t("metaDescription"),
    path: "/codigo-barras",
    locale,
    keywords: [
      "gerador de código de barras",
      "código de barras online",
      "EAN-13",
      "Code 128",
      "UPC",
      "barcode generator",
      "gerar código de barras",
    ],
  });
}

export default async function CodigoBarrasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CodigoBarras" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/codigo-barras",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/codigo-barras" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <BarcodeGenerator />

      <div className="mt-5">
        <CrossToolLink
          href="/linha-digitavel"
          label={t("crossToolLabel")}
          hint={t("crossToolHint")}
        />
      </div>

      <section className="mx-auto mt-6 max-w-3xl space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
          {t("howToTitle")}
        </h2>
        <p>{t("howToBody")}</p>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
          {t("formatsTitle")}
        </h2>
        <p>{t("formatsBody")}</p>
      </section>

      <RelatedTools currentHref="/codigo-barras" />
    </main>
  );
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DigitableLineConverter } from "@/components/barcode/DigitableLineConverter";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqSection, SeoArticle } from "@/components/seo/SeoSections";
import { RelatedTools } from "@/components/tools/RelatedTools";
import {
  buildMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webAppJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

function getFaqs(t: (key: string) => string) {
  return [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LinhaDigitavel" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/linha-digitavel",
    locale,
    keywords: [
      "linha digitável para código de barras",
      "converter linha digitável",
      "gerar código de barras boleto",
      "linha digitável boleto",
      "boleto 47 dígitos",
      "conta 48 dígitos",
    ],
  });
}

export default async function LinhaDigitavelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "LinhaDigitavel" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const faqs = getFaqs(t);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/linha-digitavel",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("breadcrumbCodes"), path: "/codigo-barras" },
            {
              name: t("title"),
              path: "/linha-digitavel",
            },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howToName"),
            description: t("howToDescription"),
            path: "/linha-digitavel",
            steps: [
              {
                name: t("howToStep1Name"),
                text: t("howToStep1Text"),
              },
              {
                name: t("howToStep2Name"),
                text: t("howToStep2Text"),
              },
              {
                name: t("howToStep3Name"),
                text: t("howToStep3Text"),
              },
            ],
          }),
        ]}
      />

      <AdSlot size="leaderboard" className="mb-4" />
      <DigitableLineConverter />

      <section className="mx-auto mt-6 max-w-3xl space-y-6">
        <SeoArticle title={t("seoTitle1")}>
          <p>{t("seoBody1")}</p>
        </SeoArticle>

        <SeoArticle title={t("seoTitle2")}>
          <p>{t("seoBody2")}</p>
        </SeoArticle>

        <SeoArticle title={t("seoTitle3")}>
          <p>
            {t("seoBody3Before")}{" "}
            <Link
              href="/codigo-barras"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seoBody3Link")}
            </Link>
            {t("seoBody3After")}
          </p>
        </SeoArticle>

        <FaqSection title={tCommon("faqTitle")} faqs={faqs} />
      </section>

      <RelatedTools currentHref="/linha-digitavel" />
    </main>
  );
}

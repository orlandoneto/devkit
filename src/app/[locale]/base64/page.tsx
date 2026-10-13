import { setRequestLocale, getTranslations } from "next-intl/server";
import { Base64Tool } from "@/components/base64/Base64Tool";
import { Base64SeoContent } from "@/components/base64/Base64SeoContent";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webAppJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Base64" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/base64",
    locale,
    keywords: [
      "base64",
      "converter arquivo para base64",
      "pdf para base64",
      "imagem para base64",
      "docx para base64",
      "zip para base64",
      "apk para base64",
      "base64 para arquivo",
      "base64 para pdf",
      "encode base64 online",
      "decode base64 online",
      "base64 universal",
    ],
  });
}

export default async function Base64Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Base64" });

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/base64",
            description: t("metaDescription"),
            locale,
          }),
          breadcrumbJsonLd(
            [
              { name: SITE.name, path: "/" },
              { name: t("title"), path: "/base64" },
            ],
            locale,
          ),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/base64",
            locale,
            steps: [
              { name: t("howto.step1Name"), text: t("howto.step1Text") },
              { name: t("howto.step2Name"), text: t("howto.step2Text") },
              { name: t("howto.step3Name"), text: t("howto.step3Text") },
            ],
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <Base64Tool />
      <Base64SeoContent />
      <RelatedTools currentHref="/base64" />
    </main>
  );
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { DynamicQRManager } from "@/components/qrcode/DynamicQRManager";
import {
  DynamicQRSeoContent,
  getDynamicQrFaqs,
} from "@/components/qrcode/DynamicQRSeoContent";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
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

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "QrDinamico" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/qr-code/dinamico",
    locale,
    keywords: [
      "QR Code dinâmico",
      "QR Code status",
      "QR Code campanha",
      "QR Code expiração",
      "gerador QR dinâmico",
    ],
  });
}

export default async function DynamicQRPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "QrDinamico" });
  const faqs = getDynamicQrFaqs(t);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/qr-code/dinamico",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("breadcrumbQr"), path: "/qr-code" },
            { name: t("breadcrumbDynamic"), path: "/qr-code/dinamico" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howToName"),
            description: t("howToDescription"),
            path: "/qr-code/dinamico",
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
      <DynamicQRManager />
      <DynamicQRSeoContent />
      <RelatedTools currentHref="/qr-code/dinamico" />
    </main>
  );
}

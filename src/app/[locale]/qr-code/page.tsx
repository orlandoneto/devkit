import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { QRCodeGenerator } from "@/components/qrcode/QRCodeGenerator";
import {
  QRCodeSeoContent,
  getQrCodeFaqs,
} from "@/components/qrcode/QRCodeSeoContent";
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
  const t = await getTranslations({ locale, namespace: "QrCode" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/qr-code",
    locale,
    keywords: [
      "gerador de QR Code",
      "QR Code online",
      "QR Code Wi-Fi",
      "QR Code WhatsApp",
      "QR Code URL",
      "criar QR Code",
      "baixar QR Code PNG SVG",
    ],
  });
}

export default async function QRCodePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "QrCode" });
  const faqs = getQrCodeFaqs(t);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/qr-code",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("breadcrumbCodes"), path: "/qr-code" },
            { name: t("title"), path: "/qr-code" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howToName"),
            description: t("howToDescription"),
            path: "/qr-code",
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
      <QRCodeGenerator />
      <QRCodeSeoContent />
      <RelatedTools currentHref="/qr-code" />
    </main>
  );
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { OCRTool } from "@/components/ocr/OCRTool";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
import {
  buildMetadata,
  breadcrumbJsonLd,
  webAppJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Ocr" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/ocr",
    locale,
    keywords: [
      "OCR online",
      "extrair texto imagem",
      "OCR boleto",
      "OCR CPF",
      "OCR navegador",
    ],
  });
}

export default async function OCRPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Ocr" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/ocr",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/ocr" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <OCRTool />
      <RelatedTools
        currentHref="/ocr"
        prefer={["/metadados", "/qr-code", "/codigo-barras", "/linha-digitavel"]}
      />
    </main>
  );
}

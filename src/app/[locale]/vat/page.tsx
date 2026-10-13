import { setRequestLocale, getTranslations } from "next-intl/server";
import { VATTool } from "@/components/vat/VATTool";
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
  const t = await getTranslations({ locale, namespace: "Vat" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/vat",
    locale,
    keywords: ["VAT generator", "VAT validator", "EU VAT", "IVA"],
  });
}

export default async function VATPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Vat" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/vat",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/vat" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <VATTool />
      <RelatedTools currentHref="/vat" />
    </main>
  );
}

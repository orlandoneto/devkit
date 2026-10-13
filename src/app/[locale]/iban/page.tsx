import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { IBANTool } from "@/components/iban/IBANTool";
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
  const t = await getTranslations({ locale, namespace: "Iban" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/iban",
    locale,
    keywords: ["IBAN generator", "IBAN validator", "European IBAN", "test IBAN"],
  });
}

export default async function IBANPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Iban" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/iban",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/iban" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <IBANTool />
      <RelatedTools currentHref="/iban" />
    </main>
  );
}

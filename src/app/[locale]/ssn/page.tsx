import { setRequestLocale, getTranslations } from "next-intl/server";
import { SSNTool } from "@/components/ssn/SSNTool";
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
  const t = await getTranslations({ locale, namespace: "Ssn" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/ssn",
    locale,
    keywords: ["SSN generator", "SSN validator", "Social Security Number", "US SSN"],
  });
}

export default async function SSNPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Ssn" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/ssn",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/ssn" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <SSNTool />
      <RelatedTools currentHref="/ssn" />
    </main>
  );
}

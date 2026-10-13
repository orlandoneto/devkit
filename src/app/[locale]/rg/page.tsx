import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { RGGenerator } from "@/components/rg/RGGenerator";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Rg" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/rg",
    locale,
    keywords: ["gerador de rg", "rg fictício", "rg para teste", "fake rg generator"],
  });
}

export default async function RGPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Rg" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/rg",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/rg" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <RGGenerator />
      <RelatedTools currentHref="/rg" />
    </main>
  );
}

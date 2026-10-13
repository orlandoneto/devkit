import { setRequestLocale, getTranslations } from "next-intl/server";
import { JsonTool } from "@/components/json/JsonTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Json" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/json",
    locale,
    keywords: ["json formatter", "formatar json", "beautify json", "minify json"],
  });
}

export default async function JsonPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Json" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/json",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/json" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <JsonTool />
      <RelatedTools currentHref="/json" />
    </main>
  );
}

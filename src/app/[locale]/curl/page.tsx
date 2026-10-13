import { setRequestLocale, getTranslations } from "next-intl/server";
import { CurlTool } from "@/components/curl/CurlTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Curl" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/curl",
    locale,
    keywords: ["curl generator", "gerar curl", "http curl", "api curl"],
  });
}

export default async function CurlPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Curl" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/curl",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/curl" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <CurlTool />
      <RelatedTools currentHref="/curl" />
    </main>
  );
}

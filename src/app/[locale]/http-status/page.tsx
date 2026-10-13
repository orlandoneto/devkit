import { setRequestLocale, getTranslations } from "next-intl/server";
import { HttpStatusTool } from "@/components/http-status/HttpStatusTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HttpStatus" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/http-status",
    locale,
    keywords: [
      "http status codes",
      "códigos http",
      "404",
      "500",
      "http errors",
      "status code reference",
    ],
  });
}

export default async function HttpStatusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HttpStatus" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/http-status",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/http-status" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <HttpStatusTool />
      <RelatedTools currentHref="/http-status" />
    </main>
  );
}

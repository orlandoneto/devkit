import { setRequestLocale, getTranslations } from "next-intl/server";
import { MetadataTool } from "@/components/metadata/MetadataTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadados" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/metadados",
    locale,
    keywords: ["exif", "metadados imagem", "gps foto", "image metadata"],
  });
}

export default async function MetadadosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadados" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/metadados",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/metadados" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <MetadataTool />
      <RelatedTools
        currentHref="/metadados"
        prefer={["/ocr", "/qr-code", "/codigo-barras"]}
      />
    </main>
  );
}

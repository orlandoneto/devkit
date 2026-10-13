import { setRequestLocale, getTranslations } from "next-intl/server";
import { JwtTool } from "@/components/jwt/JwtTool";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Jwt" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/jwt",
    locale,
    keywords: ["jwt", "decode jwt", "encode jwt", "validar jwt", "hs256"],
  });
}

export default async function JwtPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Jwt" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/jwt",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/jwt" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <JwtTool />
      <RelatedTools currentHref="/jwt" />
    </main>
  );
}

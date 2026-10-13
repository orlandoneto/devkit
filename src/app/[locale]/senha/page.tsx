import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PasswordGenerator } from "@/components/password/PasswordGenerator";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Senha" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/senha",
    locale,
    keywords: [
      "gerador de senha",
      "senha forte",
      "password generator",
      "gerar senha",
    ],
  });
}

export default async function PasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Senha" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/senha",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/senha" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <PasswordGenerator />
      <RelatedTools currentHref="/senha" />
    </main>
  );
}

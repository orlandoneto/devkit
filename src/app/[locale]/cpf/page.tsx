import { setRequestLocale, getTranslations } from "next-intl/server";
import { CPFTool } from "@/components/cpf/CPFTool";
import { CPFSeoContent } from "@/components/cpf/CPFSeoContent";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webAppJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cpf" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cpf",
    locale,
    keywords: [
      "gerador de cpf",
      "gerador de cpf válido",
      "cpf com máscara",
      "cpf sem máscara",
      "gerar cpf para teste",
      "cpf aleatório",
      "CPF generator",
      "valid CPF",
    ],
  });
}

export default async function CPFPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Cpf" });
  const tg = await getTranslations({ locale, namespace: "Groups" });

  const faqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/cpf",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: tg("documentos"), path: "/pessoa" },
            { name: t("title"), path: "/cpf" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/cpf",
            steps: [
              { name: t("howto.step1Name"), text: t("howto.step1Text") },
              { name: t("howto.step2Name"), text: t("howto.step2Text") },
              { name: t("howto.step3Name"), text: t("howto.step3Text") },
              { name: t("howto.step4Name"), text: t("howto.step4Text") },
            ],
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <CPFTool />
      <CPFSeoContent />
      <RelatedTools currentHref="/cpf" />
    </main>
  );
}

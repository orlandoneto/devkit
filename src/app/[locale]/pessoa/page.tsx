import { setRequestLocale, getTranslations } from "next-intl/server";
import { PersonGenerator } from "@/components/pessoa/PersonGenerator";
import { PessoaSeoContent } from "@/components/pessoa/PessoaSeoContent";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedTools } from "@/components/tools/RelatedTools";
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
  const t = await getTranslations({ locale, namespace: "Pessoa" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/pessoa",
    locale,
    keywords: [
      "gerador de pessoa",
      "gerador de dados fictícios",
      "gerar CPF RG CNH",
      "gerar endereço para teste",
      "massa de dados",
      "fixtures",
      "person generator",
    ],
  });
}

export default async function PessoaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Pessoa" });
  const tg = await getTranslations({ locale, namespace: "Groups" });

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/pessoa",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: tg("documentos"), path: "/pessoa" },
            { name: t("title"), path: "/pessoa" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/pessoa",
            steps: [
              { name: t("howto.step1Name"), text: t("howto.step1Text") },
              { name: t("howto.step2Name"), text: t("howto.step2Text") },
              { name: t("howto.step3Name"), text: t("howto.step3Text") },
            ],
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <PersonGenerator />
      <PessoaSeoContent />
      <RelatedTools currentHref="/pessoa" />
    </main>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { CPFValidatorTool } from "@/components/cpf/CPFValidatorTool";
import { CPFValidatorSeoContent } from "@/components/cpf/CPFValidatorSeoContent";
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
  const t = await getTranslations({ locale, namespace: "CpfValidar" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cpf/validar",
    locale,
    keywords: [
      "validador de cpf",
      "validar cpf",
      "cpf válido ou inválido",
      "calcular dígito verificador cpf",
      "CPF validator",
    ],
  });
}

export default async function CPFValidatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CpfValidar" });
  const tCpf = await getTranslations({ locale, namespace: "Cpf" });

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
            path: "/cpf/validar",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: tCpf("title"), path: "/cpf" },
            { name: t("title"), path: "/cpf/validar" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/cpf/validar",
            steps: [
              { name: t("howto.step1Name"), text: t("howto.step1Text") },
              { name: t("howto.step2Name"), text: t("howto.step2Text") },
              { name: t("howto.step3Name"), text: t("howto.step3Text") },
            ],
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <CPFValidatorTool />
      <CPFValidatorSeoContent />
      <RelatedTools currentHref="/cpf/validar" />
    </main>
  );
}

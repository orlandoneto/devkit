import { setRequestLocale, getTranslations } from "next-intl/server";
import { CNPJValidator } from "@/components/cnpj/CNPJValidator";
import { CNPJValidatorSeoContent } from "@/components/cnpj/CNPJValidatorSeoContent";
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
  const t = await getTranslations({ locale, namespace: "CnpjValidar" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/cnpj/validar",
    locale,
    keywords: [
      "validador de cnpj",
      "validar cnpj",
      "cnpj válido ou inválido",
      "calcular dígito verificador cnpj",
      "CNPJ validator",
    ],
  });
}

export default async function CNPJValidatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CnpjValidar" });
  const tCnpj = await getTranslations({ locale, namespace: "Cnpj" });

  const faqs = [1, 2, 3, 4].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/cnpj/validar",
            description: t("metaDescription"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: tCnpj("title"), path: "/cnpj" },
            { name: t("title"), path: "/cnpj/validar" },
          ]),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/cnpj/validar",
            steps: [
              { name: t("howto.step1Name"), text: t("howto.step1Text") },
              { name: t("howto.step2Name"), text: t("howto.step2Text") },
              { name: t("howto.step3Name"), text: t("howto.step3Text") },
            ],
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <CNPJValidator />
      <CNPJValidatorSeoContent />
      <RelatedTools currentHref="/cnpj/validar" />
    </main>
  );
}

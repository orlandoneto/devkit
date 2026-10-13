import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqSection, SeoArticle } from "@/components/seo/SeoSections";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  howToJsonLd,
  webAppJsonLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";
import { MATH_TOOLS } from "@/lib/math/nav";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function MathToolPage({
  namespace,
  path,
  locale,
  children,
}: {
  namespace: string;
  path: string;
  locale: string;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace });
  const tg = await getTranslations({ locale, namespace: "Groups" });
  const tc = await getTranslations({ locale, namespace: "Common" });
  const prefer = MATH_TOOLS.map((tool) => tool.href).filter((href) => href !== path);
  const title = t("title");
  const metaDescription = t("metaDescription");
  const faqs = [1, 2, 3, 4].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${title} — ${SITE.name}`,
            path,
            description: metaDescription,
            locale,
          }),
          breadcrumbJsonLd(
            [
              { name: SITE.name, path: "/" },
              { name: tg("matematica"), path: "/romanos" },
              { name: title, path },
            ],
            locale,
          ),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path,
            locale,
            steps: [1, 2, 3].map((i) => ({
              name: t(`howto.step${i}Name`),
              text: t(`howto.step${i}Text`),
            })),
          }),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      {children}
      <section className="mt-6 space-y-6">
        <SeoArticle title={t("seoTitle")}>
          <p>{t("seoBody")}</p>
        </SeoArticle>
        <FaqSection title={tc("faqTitle")} faqs={faqs} />
      </section>
      <RelatedTools currentHref={path} prefer={[...prefer]} />
    </main>
  );
}

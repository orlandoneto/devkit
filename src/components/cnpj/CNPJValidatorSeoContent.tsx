import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export async function CNPJValidatorSeoContent() {
  const t = await getTranslations("CnpjValidar");
  const tc = await getTranslations("Common");

  const faqs = [1, 2, 3, 4].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/cnpj"
        label={t("seo.crossLabel")}
        hint={t("seo.crossHint")}
      />

      <SeoArticle title={t("seo.howTitle")}>
        <p>
          {t("seo.howBefore")}
          <Link
            href="/cnpj"
            className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {t("seo.howLink")}
          </Link>
          {t("seo.howAfter")}
        </p>
      </SeoArticle>

      <FaqSection title={tc("faqTitle")} faqs={faqs} />
    </section>
  );
}

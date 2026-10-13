import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export async function CPFValidatorSeoContent() {
  const t = await getTranslations("CpfValidar");
  const tc = await getTranslations("Common");

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/cpf"
        label={t("seo.crossLabel")}
        hint={t("seo.crossHint")}
      />

      <SeoArticle title={t("seo.howTitle")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seo.how1")}</li>
          <li>{t("seo.how2")}</li>
          <li>{t("seo.how3")}</li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seo.checksTitle")}>
        <p>{t("seo.checksBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.vsTitle")}>
        <p>
          {t("seo.vsBefore")}
          <Link
            href="/cpf"
            className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {t("seo.vsLink")}
          </Link>
          {t("seo.vsAfter")}
        </p>
      </SeoArticle>

      <FaqSection title={tc("faqTitle")} faqs={faqs} />
    </section>
  );
}

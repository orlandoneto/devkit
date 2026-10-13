import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export async function Base64SeoContent() {
  const t = await getTranslations("Base64");

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <SeoArticle title={t("seo.whatTitle")}>
        <p>{t("seo.whatBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.fileTitle")}>
        <p>{t("seo.fileBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.formatsTitle")}>
        <p>{t("seo.formatsBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.howTitle")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seo.how1")}</li>
          <li>{t("seo.how2")}</li>
          <li>{t("seo.how3")}</li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seo.privacyTitle")}>
        <p>
          {t("seo.privacyBefore")}
          <Link
            href="/jwt"
            className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {t("seo.privacyLink")}
          </Link>
          {t("seo.privacyAfter")}
        </p>
      </SeoArticle>

      <FaqSection title={t("seo.faqTitle")} faqs={faqs} />
    </section>
  );
}

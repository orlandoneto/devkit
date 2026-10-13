import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export async function CPFSeoContent() {
  const t = await getTranslations("Cpf");
  const tc = await getTranslations("Common");

  const faqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/cpf/validar"
        label={t("seo.crossLabel")}
        hint={t("seo.crossHint")}
      />

      <SeoArticle title={t("seo.validTitle")}>
        <p>{t("seo.validBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.maskedTitle")}>
        <p>{t("seo.maskedBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.unmaskedTitle")}>
        <p>{t("seo.unmaskedBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.testsTitle")}>
        <p>
          {t("seo.testsBefore")}
          <Link
            href="/pessoa"
            className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {t("seo.testsLink")}
          </Link>
          {t("seo.testsAfter")}
        </p>
      </SeoArticle>

      <SeoArticle title={t("seo.howTitle")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seo.how1")}</li>
          <li>{t("seo.how2")}</li>
          <li>{t("seo.how3")}</li>
          <li>
            {t("seo.how4Before")}
            <Link
              href="/cpf/validar"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seo.how4Link")}
            </Link>
            {t("seo.how4After")}
          </li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seo.algoTitle")}>
        <p>{t("seo.algoP1")}</p>
        <p>{t("seo.algoP2")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.whatTitle")}>
        <p>{t("seo.whatBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.practicesTitle")}>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>{t("seo.practice1")}</li>
          <li>{t("seo.practice2")}</li>
          <li>{t("seo.practice3")}</li>
          <li>{t("seo.practice4")}</li>
        </ul>
      </SeoArticle>

      <FaqSection title={tc("faqTitle")} faqs={faqs} />
    </section>
  );
}

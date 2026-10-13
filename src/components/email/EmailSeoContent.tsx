import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  CrossToolLink,
  FaqSection,
  SeoArticle,
} from "@/components/seo/SeoSections";

export async function EmailSeoContent() {
  const t = await getTranslations("Email");
  const tc = await getTranslations("Common");

  const faqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/pessoa"
        label={t("seo.crossLabel")}
        hint={t("seo.crossHint")}
      />

      <SeoArticle title={t("seo.whatTitle")}>
        <p>{t("seo.whatBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.notInboxTitle")}>
        <p>{t("seo.notInboxBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.domainsTitle")}>
        <p>{t("seo.domainsBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.formatsTitle")}>
        <p>{t("seo.formatsIntro")}</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>{t("seo.formatNomeSobrenome")}</li>
          <li>{t("seo.formatUnderline")}</li>
          <li>{t("seo.formatInicial")}</li>
          <li>{t("seo.formatNumero")}</li>
          <li>{t("seo.formatAleatorio")}</li>
        </ul>
      </SeoArticle>

      <SeoArticle title={t("seo.howTitle")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seo.how1")}</li>
          <li>{t("seo.how2")}</li>
          <li>{t("seo.how3")}</li>
          <li>
            {t("seo.how4Before")}
            <Link
              href="/pessoa"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seo.how4Link")}
            </Link>
            {t("seo.how4After")}
          </li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seo.localTitle")}>
        <p>{t("seo.localBody")}</p>
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

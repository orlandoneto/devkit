import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export async function PessoaSeoContent() {
  const t = await getTranslations("Pessoa");
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

      <SeoArticle title={t("seo.fictionTitle")}>
        <p>{t("seo.fictionBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.docsTitle")}>
        <p>{t("seo.docsBody")}</p>
      </SeoArticle>

      <SeoArticle title={t("seo.massTitle")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seo.mass1")}</li>
          <li>{t("seo.mass2")}</li>
          <li>{t("seo.mass3")}</li>
          <li>
            {t("seo.mass4Before")}
            <Link
              href="/cpf"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seo.mass4Cpf")}
            </Link>
            {t("seo.mass4Mid1")}
            <Link
              href="/cnpj"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seo.mass4Cnpj")}
            </Link>
            {t("seo.mass4Mid2")}
            <Link
              href="/rg"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seo.mass4Rg")}
            </Link>
            {t("seo.mass4After")}
          </li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seo.addressTitle")}>
        <p>{t("seo.addressBody")}</p>
      </SeoArticle>

      <FaqSection title={tc("faqTitle")} faqs={faqs} />
    </section>
  );
}

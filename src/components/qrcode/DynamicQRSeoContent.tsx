import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export function getDynamicQrFaqs(t: (key: string) => string) {
  return [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
  ];
}

export async function DynamicQRSeoContent() {
  const t = await getTranslations("QrDinamico");
  const tCommon = await getTranslations("Common");
  const faqs = getDynamicQrFaqs(t);

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/qr-code"
        label={t("crossToolLabel")}
        hint={t("crossToolHint")}
      />

      <SeoArticle title={t("seoTitle1")}>
        <p>{t("seoBody1")}</p>
      </SeoArticle>

      <SeoArticle title={t("seoTitle2")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seoStep1")}</li>
          <li>{t("seoStep2")}</li>
          <li>{t("seoStep3")}</li>
          <li>{t("seoStep4")}</li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seoTitle3")}>
        <p>
          {t("seoBody3Before")}{" "}
          <Link
            href="/qr-code"
            className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
          >
            {t("seoBody3Link")}
          </Link>{" "}
          {t("seoBody3After")}
        </p>
      </SeoArticle>

      <FaqSection title={tCommon("faqTitle")} faqs={faqs} />
    </section>
  );
}

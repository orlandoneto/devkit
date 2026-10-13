import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CrossToolLink, FaqSection, SeoArticle } from "@/components/seo/SeoSections";

export function getQrCodeFaqs(t: (key: string) => string) {
  return [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
    { question: t("faq5Q"), answer: t("faq5A") },
  ];
}

export async function QRCodeSeoContent() {
  const t = await getTranslations("QrCode");
  const tCommon = await getTranslations("Common");
  const faqs = getQrCodeFaqs(t);

  return (
    <section className="mx-auto mt-6 max-w-3xl space-y-6">
      <CrossToolLink
        href="/qr-code/dinamico"
        label={t("crossToolLabel")}
        hint={t("crossToolHint")}
      />

      <SeoArticle title={t("seoTitle1")}>
        <p>{t("seoBody1")}</p>
      </SeoArticle>

      <SeoArticle title={t("seoTitle2")}>
        <p>{t("seoBody2")}</p>
      </SeoArticle>

      <SeoArticle title={t("seoTitle3")}>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>{t("seoStep1")}</li>
          <li>{t("seoStep2")}</li>
          <li>{t("seoStep3")}</li>
          <li>
            {t("seoStep4Before")}{" "}
            <Link
              href="/qr-code/dinamico"
              className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {t("seoStep4Link")}
            </Link>
            {t("seoStep4After")}
          </li>
        </ol>
      </SeoArticle>

      <SeoArticle title={t("seoTitle4")}>
        <p>{t("seoBody4")}</p>
      </SeoArticle>

      <FaqSection title={tCommon("faqTitle")} faqs={faqs} />
    </section>
  );
}

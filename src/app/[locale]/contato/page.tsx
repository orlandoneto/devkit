import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { RichText } from "@/components/legal/RichText";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqSection, SeoArticle } from "@/components/seo/SeoSections";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  howToJsonLd,
  localizedPath,
  schemaLanguage,
} from "@/lib/seo";
import { absoluteUrl, PUBLIC_CONTACT_EMAIL, SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/contato",
    locale,
    keywords: t("keywords")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
}

export default async function ContatoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Contact" });
  const tc = await getTranslations({ locale, namespace: "Common" });
  const faqs = [1, 2, 3, 4, 5, 6].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: SITE.name, path: "/" },
              { name: t("title"), path: "/contato" },
            ],
            locale,
          ),
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howto.name"),
            description: t("howto.description"),
            path: "/contato",
            locale,
            steps: [1, 2, 3].map((i) => ({
              name: t(`howto.step${i}Name`),
              text: t(`howto.step${i}Text`),
            })),
          }),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: t("title"),
            description: t("metaDescription"),
            url: absoluteUrl(localizedPath("/contato", locale)),
            inLanguage: schemaLanguage(locale),
            isPartOf: {
              "@type": "WebSite",
              name: SITE.name,
              url: absoluteUrl("/"),
            },
          },
        ]}
      />

      <header className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("intro")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("wait")}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("required")}
        </p>
      </header>

      <section className="mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
          {t("emailTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {t("emailBody")}
        </p>
        <a
          href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
          className="mt-3 inline-flex text-sm font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
        >
          {PUBLIC_CONTACT_EMAIL}
        </a>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("emailNote")}
        </p>
      </section>

      <ContactForm />

      <section className="mt-10 max-w-2xl space-y-6">
        <SeoArticle title={t("seoTitle")}>
          <p>{t("seoBody")}</p>
          <p>{t("seoBody2")}</p>
        </SeoArticle>
        <SeoArticle title={t("scopeTitle")}>
          <p>{t("scopeBody")}</p>
          <RichText text={t("scopeBody2")} />
        </SeoArticle>
        <FaqSection title={tc("faqTitle")} faqs={faqs} />
      </section>
    </main>
  );
}

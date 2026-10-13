import { getTranslations } from "next-intl/server";
import { RichText } from "@/components/legal/RichText";
import { FaqSection } from "@/components/seo/SeoSections";
import { JsonLd } from "@/components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import { faqJsonLd, howToJsonLd } from "@/lib/seo";

const HIGHLIGHTS = [
  { id: "h1", href: "/cpf" },
  { id: "h2", href: "/cnpj" },
  { id: "h3", href: "/qr-code" },
  { id: "h4", href: "/base64" },
  { id: "h5", href: "/jwt" },
  { id: "h6", href: "/pessoa" },
] as const;

const AUDIENCE = ["dev", "qa", "student"] as const;

export async function HomeGuide() {
  const t = await getTranslations("Home.guide");
  const steps = [1, 2, 3, 4].map((i) => ({
    name: t(`step${i}Name`),
    text: t(`step${i}Text`),
  }));
  const faqs = [1, 2, 3, 4].map((i) => ({
    question: t(`faq${i}q`),
    answer: t(`faq${i}a`),
  }));

  return (
    <div className="mt-16 space-y-14 border-t border-stone-200 pt-12 dark:border-stone-800">
      <JsonLd
        data={[
          faqJsonLd(faqs),
          howToJsonLd({
            name: t("howName"),
            description: t("howDescription"),
            path: "/",
            steps,
          }),
        ]}
      />

      <section id="o-que-e" className="max-w-3xl scroll-mt-20">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("whatTitle")}
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <RichText text={[t("what1"), t("what2"), t("what3")].join("\n\n")} />
        </div>
      </section>

      <section id="para-quem" className="scroll-mt-20">
        <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("audienceTitle")}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {AUDIENCE.map((key) => (
            <article
              key={key}
              className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-slate-950"
            >
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-slate-900 dark:text-white">
                {t(`audience.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t(`audience.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="o-que-nao-e" className="max-w-3xl scroll-mt-20">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("notTitle")}
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <RichText text={[t("not1"), t("not2")].join("\n\n")} />
        </div>
      </section>

      <section id="como-usar" className="max-w-3xl scroll-mt-20">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("howTitle")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("howIntro")}
        </p>
        <ol className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <li key={step.name} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-amber-400 dark:bg-amber-500 dark:text-slate-950">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {step.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="ferramentas" className="scroll-mt-20">
        <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("highlightsTitle")}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("highlightsIntro")}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.href}
              className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-slate-950"
            >
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">
                {t(`${item.id}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t(`${item.id}Body`)}
              </p>
              <Link
                href={item.href}
                className="mt-3 inline-flex text-sm font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
              >
                {t(`${item.id}Link`)}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="confianca" className="scroll-mt-20">
        <aside className="max-w-3xl rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-slate-900 dark:text-white">
            {t("trustTitle")}
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <RichText text={[t("trust1"), t("trust2")].join("\n\n")} />
          </div>
        </aside>
      </section>

      <section id="perguntas" className="max-w-3xl scroll-mt-20">
        <FaqSection title={t("faqTitle")} faqs={faqs} />
      </section>
    </div>
  );
}

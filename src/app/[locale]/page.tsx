import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeGuide } from "@/components/home/HomeGuide";
import { HomeLauncher } from "@/components/home/HomeToolsCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });
  return buildMetadata({
    title: t("seoTitle"),
    description: t("description"),
    path: "/",
    locale,
    absoluteTitle: true,
    keywords: [
      "gerador de cpf",
      "gerador de cnpj",
      "iban generator",
      "ssn generator",
      "vat validator",
      "qr code",
      "developer tools",
    ],
  });
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const raw = sp.q;
  const initialQuery = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 h-56 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08),_transparent_65%)]"
      />
      <JsonLd
        data={breadcrumbJsonLd([{ name: SITE.name, path: "/" }], locale)}
      />

      <section className="relative max-w-2xl">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.22em] text-amber-700 uppercase dark:text-amber-400">
          {SITE.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          {t("subtitle")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("guide.lead")}
        </p>
      </section>

      <div className="relative mt-8">
        <HomeLauncher initialQuery={initialQuery} />
      </div>

      <HomeGuide />
    </main>
  );
}

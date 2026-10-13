import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbJsonLd, webAppJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pomodoro" });
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/pomodoro",
    locale,
    keywords: [
      "pomodoro",
      "timer pomodoro",
      "técnica pomodoro",
      "pomodoro online",
      "focus timer",
    ],
  });
}

export default async function PomodoroPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Pomodoro" });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          webAppJsonLd({
            name: `${t("title")} — ${SITE.name}`,
            path: "/pomodoro",
            description: t("description"),
          }),
          breadcrumbJsonLd([
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/pomodoro" },
          ]),
        ]}
      />
      <AdSlot size="leaderboard" className="mb-4" />
      <PomodoroTimer />
      <RelatedTools currentHref="/pomodoro" />
    </main>
  );
}

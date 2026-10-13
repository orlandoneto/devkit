import { setRequestLocale, getTranslations } from "next-intl/server";
import { RuleOfThreeTool } from "@/components/math/RuleOfThreeTool";
import { MathToolPage } from "@/components/math/MathToolPage";
import { mathMetadata } from "@/lib/math/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Regra3" });
  return mathMetadata(t, "/regra-de-3", locale);
}

export default async function RegraDe3Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MathToolPage namespace="Regra3" path="/regra-de-3" locale={locale}>
      <RuleOfThreeTool />
    </MathToolPage>
  );
}

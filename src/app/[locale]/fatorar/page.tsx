import { setRequestLocale, getTranslations } from "next-intl/server";
import { FactorsTool } from "@/components/math/FactorsTool";
import { MathToolPage } from "@/components/math/MathToolPage";
import { mathMetadata } from "@/lib/math/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Fatorar" });
  return mathMetadata(t, "/fatorar", locale);
}

export default async function FatorarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MathToolPage namespace="Fatorar" path="/fatorar" locale={locale}>
      <FactorsTool />
    </MathToolPage>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { RomanTool } from "@/components/math/RomanTool";
import { MathToolPage } from "@/components/math/MathToolPage";
import { mathMetadata } from "@/lib/math/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Romanos" });
  return mathMetadata(t, "/romanos", locale);
}

export default async function RomanosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MathToolPage namespace="Romanos" path="/romanos" locale={locale}>
      <RomanTool />
    </MathToolPage>
  );
}

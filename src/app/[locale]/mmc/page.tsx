import { setRequestLocale, getTranslations } from "next-intl/server";
import { GcdLcmTool } from "@/components/math/GcdLcmTool";
import { MathToolPage } from "@/components/math/MathToolPage";
import { mathMetadata } from "@/lib/math/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mmc" });
  return mathMetadata(t, "/mmc", locale);
}

export default async function MmcPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MathToolPage namespace="Mmc" path="/mmc" locale={locale}>
      <GcdLcmTool kind="lcm" />
    </MathToolPage>
  );
}

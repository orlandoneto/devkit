import { setRequestLocale, getTranslations } from "next-intl/server";
import { RemainderTool } from "@/components/math/RemainderTool";
import { MathToolPage } from "@/components/math/MathToolPage";
import { mathMetadata } from "@/lib/math/page-meta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Resto" });
  return mathMetadata(t, "/resto", locale);
}

export default async function RestoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <MathToolPage namespace="Resto" path="/resto" locale={locale}>
      <RemainderTool />
    </MathToolPage>
  );
}

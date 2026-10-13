import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

/** URL antiga — 308 permanente para consolidar SEO em /base64. */
export default async function Base64ArquivoRedirect({ params }: Props) {
  const { locale } = await params;
  const target =
    locale === routing.defaultLocale ? "/base64" : `/${locale}/base64`;
  permanentRedirect(target);
}

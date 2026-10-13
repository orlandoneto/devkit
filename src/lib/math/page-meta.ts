import { buildMetadata } from "@/lib/seo";

export function mathMetadata(
  t: (key: string) => string,
  path: string,
  locale: string,
) {
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path,
    locale,
    keywords: t("keywords")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });
}

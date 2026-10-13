import { setRequestLocale, getTranslations } from "next-intl/server";
import { BlogCard } from "@/components/blog/BlogCard";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllPosts } from "@/lib/blog/posts";
import { routing } from "@/i18n/routing";
import { buildMetadata, breadcrumbJsonLd, localizedPath } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const blogOnlyPt = locale !== routing.defaultLocale;
  return buildMetadata({
    title: t("title"),
    description: t("description"),
    path: "/blog",
    locale,
    noIndex: blogOnlyPt,
    canonicalPath: blogOnlyPt
      ? localizedPath("/blog", routing.defaultLocale)
      : undefined,
    keywords: ["blog", "devkit", "ferramentas", "tutoriais", "developer tools"],
  });
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: SITE.name, path: "/" },
            { name: t("title"), path: "/blog" },
          ],
          routing.defaultLocale,
        )}
      />

      <header className="max-w-2xl">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.22em] text-amber-700 uppercase dark:text-amber-400">
          {SITE.name}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          {t("description")}
        </p>
      </header>

      <AdSlot size="leaderboard" className="mt-8 mb-2" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      <AdSlot size="leaderboard" className="mt-12" />
    </main>
  );
}

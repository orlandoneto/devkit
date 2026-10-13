import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPost, getPostSlugs } from "@/lib/blog/posts";
import { routing } from "@/i18n/routing";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  localizedPath,
} from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  const blogOnlyPt = locale !== routing.defaultLocale;

  return buildMetadata({
    title: post.title,
    description: post.description,
    path,
    locale,
    // Conteúdo do blog ainda é PT — EN/ES não devem competir no índice
    noIndex: blogOnlyPt,
    canonicalPath: blogOnlyPt
      ? localizedPath(path, routing.defaultLocale)
      : undefined,
    keywords: [
      post.toolLabel,
      post.slug,
      "devkit",
      "blog",
      ...(post.keywords ?? []),
    ],
    image: {
      url: absoluteUrl(post.cover.src),
      width: 1200,
      height: 675,
      alt: post.cover.alt,
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "Blog" });
  const path = `/blog/${post.slug}`;
  const coverUrl = absoluteUrl(post.cover.src);
  const schemaLocale = routing.defaultLocale;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          articleJsonLd({
            title: post.title,
            description: post.description,
            path,
            publishedAt: post.publishedAt,
            image: coverUrl,
            locale: schemaLocale,
          }),
          breadcrumbJsonLd(
            [
              { name: SITE.name, path: "/" },
              { name: t("title"), path: "/blog" },
              { name: post.title, path },
            ],
            schemaLocale,
          ),
        ]}
      />
      <BlogArticle post={post} />
    </main>
  );
}

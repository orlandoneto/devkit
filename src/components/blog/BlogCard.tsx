"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPostDate, type BlogPost } from "@/lib/blog/posts";

type Props = {
  post: BlogPost;
};

export function BlogCard({ post }: Props) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition hover:border-amber-300/80 hover:shadow-md dark:border-stone-800 dark:bg-slate-950 dark:hover:border-amber-700/50">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100 dark:bg-stone-900">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            {formatPostDate(post.publishedAt, locale)} ·{" "}
            {t("minutes", { count: post.readingMinutes })}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-900 group-hover:text-amber-800 dark:text-white dark:group-hover:text-amber-300">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {post.description}
          </p>
          <span className="mt-3 inline-block text-sm font-semibold text-amber-700 dark:text-amber-400">
            {t("readMore")} →
          </span>
        </div>
      </Link>
    </article>
  );
}

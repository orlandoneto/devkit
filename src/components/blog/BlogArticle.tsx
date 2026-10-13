"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AdSlot } from "@/components/layout/AdSlot";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatPostDate, type BlogPost } from "@/lib/blog/posts";

type Props = {
  post: BlogPost;
};

function isCodeBlock(paragraph: string) {
  const trimmed = paragraph.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    trimmed.startsWith("#!/") ||
    /^[\w./\\-]+\.(json|js|ts|tsx|sh|env|ya?ml)$/i.test(trimmed) ||
    trimmed === ".cursor/mcp.json"
  );
}

function isBulletList(paragraph: string) {
  return paragraph.trimStart().startsWith("• ");
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-stone-800 dark:text-slate-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function ArticleParagraph({ paragraph }: { paragraph: string }) {
  if (isCodeBlock(paragraph)) {
    return (
      <pre className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-4 text-[13px] leading-relaxed text-slate-800 dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100">
        <code className="font-mono whitespace-pre">{paragraph.trim()}</code>
      </pre>
    );
  }

  if (isBulletList(paragraph)) {
    const items = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (line.startsWith("• ") ? line.slice(2) : line));

    return (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
        {items.map((item) => (
          <li key={item.slice(0, 64)}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
      {renderInline(paragraph)}
    </p>
  );
}

export function BlogArticle({ post }: Props) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <article className="mx-auto w-full max-w-3xl">
      <Link
        href="/blog"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
      >
        ← {t("backToBlog")}
      </Link>

      <header className="mt-4">
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
          {formatPostDate(post.publishedAt, locale)} ·{" "}
          {t("minutes", { count: post.readingMinutes })}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          {post.description}
        </p>
      </header>

      <AdSlot size="leaderboard" className="mt-6 mb-2" />

      <figure className="relative mt-6 overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] bg-stone-100 dark:bg-stone-900">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-xs text-slate-400">
          {t("photoCredit")}{" "}
          <a
            href={post.cover.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-stone-300 underline-offset-2 hover:text-slate-600"
          >
            {post.cover.credit}
          </a>
        </figcaption>
      </figure>

      <div className="prose-devkit mt-8 space-y-8">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <ArticleParagraph
                key={paragraph.slice(0, 48)}
                paragraph={paragraph}
              />
            ))}
          </section>
        ))}
      </div>

      <AdSlot size="rectangle" className="my-10" />

      <div className="mt-10 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 dark:text-white">
          {post.toolLabel}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {post.description}
        </p>
        <Button asChild className="mt-4">
          <Link href={post.toolHref}>
            {post.toolLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <AdSlot size="leaderboard" className="mt-10" />
    </article>
  );
}

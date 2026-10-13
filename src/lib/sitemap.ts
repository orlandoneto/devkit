import { ALL_TOOLS } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog/posts";
import { absoluteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

export type SitemapPage = {
  path: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

function localizedPath(path: string, locale: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function buildSitemapPages(): SitemapPage[] {
  const now = new Date();
  const entries: SitemapPage[] = [
    { path: "/", lastModified: now, changeFrequency: "daily", priority: 1 },
    { path: "/blog", lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { path: "/contato", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { path: "/sobre", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacidade", lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { path: "/termos", lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  for (const tool of ALL_TOOLS) {
    entries.push({
      path: tool.href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  for (const post of getAllPosts()) {
    entries.push({
      path: `/blog/${post.slug}`,
      lastModified: new Date(`${post.publishedAt}T12:00:00.000Z`),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** XML indentado — Chrome/Firefox mostram a árvore com tags visíveis. */
export function renderSitemapXml(): string {
  const pages = buildSitemapPages();
  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset`,
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `  xmlns:xhtml="http://www.w3.org/1999/xhtml"`,
    `>`,
  ];

  for (const locale of routing.locales) {
    for (const page of pages) {
      // Blog ainda é só PT — não indexar triplicatas EN/ES
      const isBlog =
        page.path === "/blog" || page.path.startsWith("/blog/");
      if (isBlog && locale !== routing.defaultLocale) continue;

      const loc = absoluteUrl(localizedPath(page.path, locale));
      const lastmod = page.lastModified.toISOString().slice(0, 10);

      lines.push(`  <url>`);
      lines.push(`    <loc>${escapeXml(loc)}</loc>`);

      if (isBlog) {
        // Só a URL PT (x-default)
        const href = absoluteUrl(
          localizedPath(page.path, routing.defaultLocale),
        );
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="pt" href="${escapeXml(href)}" />`,
        );
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(href)}" />`,
        );
      } else {
        for (const code of routing.locales) {
          const href = absoluteUrl(localizedPath(page.path, code));
          lines.push(
            `    <xhtml:link rel="alternate" hreflang="${code}" href="${escapeXml(href)}" />`,
          );
        }
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(localizedPath(page.path, routing.defaultLocale)))}" />`,
        );
      }

      lines.push(`    <lastmod>${lastmod}</lastmod>`);
      lines.push(`    <changefreq>${page.changeFrequency}</changefreq>`);
      lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
      lines.push(`  </url>`);
    }
  }

  lines.push(`</urlset>`);
  return `${lines.join("\n")}\n`;
}

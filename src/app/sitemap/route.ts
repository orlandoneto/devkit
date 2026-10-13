import { renderSitemapXml } from "@/lib/sitemap";

export function GET() {
  return new Response(renderSitemapXml(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      // Ajuda o Chrome a tratar como XML (não como HTML)
      "X-Content-Type-Options": "nosniff",
    },
  });
}

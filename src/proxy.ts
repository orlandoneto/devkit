import createMiddleware from "next-intl/middleware";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { FEATURES, isClerkServerConfigured } from "@/lib/features";
import { detectUserLocale } from "@/lib/locale-detect";
import { routing } from "@/i18n/routing";

function createIntlMiddleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const isBot =
    /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot/i.test(
      ua,
    );

  // Bots: defaultLocale (pt) + hreflang — sem geo/Accept-Language forçado.
  // Humanos: idioma pelo país / navegador (pedido do produto).
  if (!isBot) {
    const locale = detectUserLocale(request);
    request.headers.set("accept-language", locale);
  }

  return createMiddleware({
    ...routing,
    localeDetection: !isBot,
    localeCookie: false,
  })(request);
}

function isBypassLocale(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/q/") ||
    pathname === "/icon" ||
    pathname.startsWith("/icon/") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon") ||
    pathname === "/opengraph-image" ||
    pathname.startsWith("/opengraph-image") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/sitemap" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/pdf.worker.min.mjs"
  );
}

export default function proxy(request: NextRequest, event: unknown) {
  const { pathname } = request.nextUrl;

  if (
    !FEATURES.publicApi &&
    (pathname.startsWith("/api/v1") || pathname.startsWith("/api/openapi"))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (FEATURES.clerkAuth && isClerkServerConfigured()) {
    return clerkMiddleware((_auth, req) => {
      if (isBypassLocale(req.nextUrl.pathname)) {
        return NextResponse.next();
      }
      return createIntlMiddleware(req);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })(request, event as any);
  }

  if (isBypassLocale(pathname)) {
    return NextResponse.next();
  }

  return createIntlMiddleware(request);
}

export const config = {
  matcher: [
    // Exclude static assets + metadata routes so next-intl doesn't intercept them
    "/((?!_next|sitemap\\.xml|robots\\.txt|[^?]*\\.(?:html?|css|js(?!on)|mjs|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};

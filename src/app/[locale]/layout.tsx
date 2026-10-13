import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppProviders } from "@/components/providers/AppProviders";
import { GoogleAdSense } from "@/components/analytics/GoogleAdSense";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import { JsonLd } from "@/components/seo/JsonLd";
import { routing } from "@/i18n/routing";
import { organizationJsonLd, siteNavigationJsonLd, websiteJsonLd } from "@/lib/seo";
import { ALL_TOOLS } from "@/lib/tools";
import { defaultOgImage, getSiteUrl, SITE } from "@/lib/site";
import "../globals.css";

const THEME_INIT = `(function(){try{var k='devkit-theme';var raw=localStorage.getItem(k);var pref='system';if(raw){var p=JSON.parse(raw);if(p&&p.state&&p.state.preference)pref=p.state.preference;}var dark=pref==='dark'||(pref!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.dataset.theme=dark?'dark':'light';}catch(e){}})();`;

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const og = defaultOgImage();

const htmlLang: Record<string, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE.defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: SITE.defaultTitle,
    description: SITE.description,
    locale: SITE.locale,
    type: "website",
    siteName: SITE.name,
    url: getSiteUrl(),
    images: [og],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.defaultTitle,
    description: SITE.description,
    images: [og.url],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale });

  return (
    <html
      lang={htmlLang[locale] ?? locale}
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <Script id="devkit-theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <GoogleAdSense />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <JsonLd
              data={[
                websiteJsonLd(locale),
                organizationJsonLd(),
                siteNavigationJsonLd(
                  [
                    { name: SITE.name, path: "/" },
                    ...ALL_TOOLS.map((tool) => ({
                      name: t(tool.titleKey),
                      path: tool.href,
                    })),
                    { name: t("Nav.blog"), path: "/blog" },
                    { name: t("Nav.about"), path: "/sobre" },
                    { name: t("Nav.contact"), path: "/contato" },
                    { name: t("Nav.privacy"), path: "/privacidade" },
                    { name: t("Nav.terms"), path: "/termos" },
                  ],
                  locale,
                ),
              ]}
            />
            <AppShell>{children}</AppShell>
            <SiteFooter />
            <Toaster richColors position="bottom-right" />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

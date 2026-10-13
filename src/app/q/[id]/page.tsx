import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { DynamicQRRedirectClient } from "@/components/qrcode/DynamicQRRedirectClient";
import { routing } from "@/i18n/routing";

export default async function DynamicQRRedirectPage() {
  const locale = routing.defaultLocale;
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: "QrDinamico" });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Suspense
        fallback={
          <main className="mx-auto flex min-h-[60vh] items-center justify-center px-4 text-sm text-slate-500">
            {t("redirectValidating")}
          </main>
        }
      >
        <DynamicQRRedirectClient />
      </Suspense>
    </NextIntlClientProvider>
  );
}

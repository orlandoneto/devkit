import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import pt from "../../messages/pt.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

const catalogs = {
  pt,
  en,
  es,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: catalogs[locale as keyof typeof catalogs] ?? catalogs.pt,
  };
});

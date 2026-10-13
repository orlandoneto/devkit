import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
  localePrefix: "as-needed",
  // Cookie desligado: o idioma segue a localização/navegador a cada visita.
  // A troca manual pelas bandeiras ainda funciona via prefixo na URL (/en, /es).
  localeCookie: false,
});

export type AppLocale = (typeof routing.locales)[number];

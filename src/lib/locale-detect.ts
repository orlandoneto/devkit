import type { NextRequest } from "next/server";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

/** Países de língua portuguesa (ISO 3166-1 alpha-2). */
const PT_COUNTRIES = new Set([
  "BR",
  "PT",
  "AO",
  "MZ",
  "CV",
  "GW",
  "ST",
  "TL",
  "GQ", // Equatorial Guinea — Portuguese co-official
]);

/** Países de língua espanhola (ISO 3166-1 alpha-2). */
const ES_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "VE",
  "EC",
  "GT",
  "CU",
  "BO",
  "DO",
  "HN",
  "PY",
  "SV",
  "NI",
  "CR",
  "PA",
  "UY",
  "PR",
]);

function countryFromRequest(request: NextRequest): string | null {
  const raw =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    request.headers.get("cloudfront-viewer-country");
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code;
}

function localeFromCountry(country: string): AppLocale | null {
  if (PT_COUNTRIES.has(country)) return "pt";
  if (ES_COUNTRIES.has(country)) return "es";
  return null;
}

function localeFromAcceptLanguage(header: string | null): AppLocale | null {
  if (!header) return null;

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (tag === "pt" || tag.startsWith("pt-")) return "pt";
    if (tag === "es" || tag.startsWith("es-")) return "es";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return null;
}

/**
 * Resolve o idioma do visitante: país (IP) → Accept-Language → default.
 * Usado no middleware para sempre refletir a localização/idioma atuais.
 */
export function detectUserLocale(request: NextRequest): AppLocale {
  const country = countryFromRequest(request);
  if (country) {
    const fromCountry = localeFromCountry(country);
    if (fromCountry) return fromCountry;
  }

  const fromHeader = localeFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  if (fromHeader) return fromHeader;

  // País conhecido sem mapeamento PT/ES (ex.: US, DE) → inglês
  if (country) return "en";

  return routing.defaultLocale;
}

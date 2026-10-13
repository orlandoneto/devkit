/**
 * Identidade do produto — devKit.
 * Preferência: variáveis de ambiente (veja .env.example).
 */
/**
 * E-mail público de contato. Troque por NEXT_PUBLIC_CONTACT_EMAIL
 * ou edite o fallback se o endereço da equipe mudar.
 */
export const PUBLIC_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "devKit",
  tagline: "Ferramentas online para desenvolvedores",
  /** Título padrão (SERP / Open Graph) — keywords primeiro. */
  defaultTitle:
    "Gerador de CPF, CNPJ, IBAN e QR Code Online | devKit",
  /** Meta description ~155 caracteres, orientada a clique. */
  description:
    "Gere e valide CPF, CNPJ, IBAN, SSN, VAT e QR Code grátis no navegador. Dados sintéticos para testes de software — sem cadastro.",
  locale: "pt_BR",
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim() || "",
} as const;

/** Canonical URL. Set NEXT_PUBLIC_SITE_URL in production. */
export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // Domínio custom na Vercel production (evita *.vercel.app no sitemap)
  // Alinhado com Domains: devkit.example.com → devkit.example.com
  if (process.env.VERCEL_ENV === "production") {
    return "https://devkit.example.com";
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Imagem Open Graph padrão (1200×630). */
export function defaultOgImage() {
  return {
    url: absoluteUrl("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${SITE.name} — ${SITE.tagline}`,
  };
}

/**
 * Feature flags — liga/desliga partes do produto sem apagar código.
 */
export const FEATURES = {
  /** API pública / OpenAPI / playground na UI */
  publicApi: false,
  /** Auth Clerk (UI de login). Requer env keys. */
  clerkAuth: true,
} as const;

/** Client-safe: só a publishable key fica disponível no browser. */
export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
}

/** Server/middleware: precisa das duas chaves. */
export function isClerkServerConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim(),
  );
}

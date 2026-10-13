import Script from "next/script";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "";

/**
 * Google AdSense — script do publisher no head (verificação + anúncios).
 * Client ID (override via NEXT_PUBLIC_ADSENSE_CLIENT_ID).
 */
export function GoogleAdSense() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}

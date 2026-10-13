import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f172a",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 42, fontWeight: 700 }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            {SITE.tagline}
          </div>
          <div style={{ fontSize: 28, color: "#cbd5e1", maxWidth: 860 }}>
            Gerador de CPF, CNPJ, IBAN, SSN, VAT e QR Code — grátis no navegador.
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#fbbf24" }}>github.com/orlandoneto/devkit</div>
      </div>
    ),
    { ...size },
  );
}

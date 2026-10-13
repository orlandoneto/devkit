import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícone Apple Touch — mesma marca do favicon. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f172a",
            fontSize: 84,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          O
        </div>
      </div>
    ),
    { ...size },
  );
}

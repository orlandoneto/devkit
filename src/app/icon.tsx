import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon devKit — “O” âmbar em fundo slate. */
export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f172a",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >d</div>
      </div>
    ),
    { ...size },
  );
}

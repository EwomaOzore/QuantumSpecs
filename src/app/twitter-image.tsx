import { ImageResponse } from "next/og";

export const alt = "QuantumSpecs operations console for Kora payments across Africa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07090c",
          color: "#e8eef6",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 20, color: "#2ee6d6", letterSpacing: 3 }}>QUANTUMSPECS</div>
        <div style={{ fontSize: 52, fontWeight: 560, lineHeight: 1.1 }}>
          Kora operations · Lagos to London
        </div>
        <div style={{ fontSize: 20, color: "#8b97a8" }}>Command · Globe · Network · Incidents</div>
      </div>
    ),
    { ...size },
  );
}

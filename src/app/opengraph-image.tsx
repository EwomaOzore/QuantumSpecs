import { ImageResponse } from "next/og";

export const alt = "QuantumSpecs operations console for Kora payments across Africa";
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
          background: "#07090c",
          color: "#e8eef6",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "2px solid #2ee6d6",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2ee6d6",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Q
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>QuantumSpecs</div>
            <div style={{ fontSize: 14, color: "#8b97a8", letterSpacing: 2 }}>KORA OPERATIONS</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 58, fontWeight: 560, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Africa-first payments command center
          </div>
          <div style={{ fontSize: 24, color: "#8b97a8", maxWidth: 820 }}>
            Live hubs from Lagos to London. Globe, network, incidents, and the operations analyst on one duty desk.
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 16, color: "#5d6b7c" }}>
          <span>Lagos</span>
          <span>Accra</span>
          <span>Nairobi</span>
          <span>Johannesburg</span>
          <span>London</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

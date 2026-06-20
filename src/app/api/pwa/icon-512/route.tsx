import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: 280, lineHeight: 1 }}>🔥</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#d97706",
            letterSpacing: "-2px",
          }}
        >
          FENIX
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}

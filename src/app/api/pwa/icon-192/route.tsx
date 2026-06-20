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
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            fontSize: 120,
            lineHeight: 1,
          }}
        >
          🔥
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}

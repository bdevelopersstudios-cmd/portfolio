import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#10141b",
          color: "#2f5eff",
          fontSize: 20,
          fontWeight: 600,
          fontFamily: "sans-serif",
        }}
      >
        U.
      </div>
    ),
    { ...size }
  );
}

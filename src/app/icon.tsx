import { ImageResponse } from "next/og";

// Replaces the default Next.js favicon with the brand mark — Chatrelo
// lime rounded speech bubble with dark obsidian checkmark on
// dark obsidian (#0f1513) rounded square. Next.js renders
// this at build time and auto-injects <link rel="icon"> into <head>.
//
// This route takes precedence over src/app/favicon.ico, which is the
// Next.js default and can stay on disk harmlessly (or be removed).

export const runtime = "edge";
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
          background: "#0f1513", // Chatrelo obsidian
          borderRadius: 6,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 3.5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8.5l-4.5 4v-4H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2z"
            fill="#c6f02c"
          />
          <path
            d="M8 11.5l3 3 5.5-5.5"
            stroke="#0f1513"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}


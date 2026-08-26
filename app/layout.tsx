import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Mohammad Usman Saud — Full-Stack Developer",
  description:
    "Full-stack developer building production web platforms with React, Next.js, Supabase, and Stripe — from pixel-perfect Figma builds to database-enforced business logic.",
  metadataBase: new URL("https://mohammadusmansaud.github.io"),
  openGraph: {
    title: "Mohammad Usman Saud — Full-Stack Developer",
    description:
      "Full-stack developer building production web platforms with React, Next.js, Supabase, and Stripe.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

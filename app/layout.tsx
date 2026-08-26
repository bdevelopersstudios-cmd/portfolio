import type { Metadata } from "next";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
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
  metadataBase: new URL("https://bdevelopersstudios-cmd.github.io/portfolio"),
  openGraph: {
    title: "Mohammad Usman Saud — Full-Stack Developer",
    description:
      "Full-stack developer building production web platforms with React, Next.js, Supabase, and Stripe.",
    type: "website",
  },
};

// Mirrors lib/theme.ts's ACCENTS — inlined because this runs before hydration,
// ahead of any JS bundle, to avoid a flash of the default theme/accent.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("portfolio-theme");
    var accentIndex = localStorage.getItem("portfolio-accent");
    var accents = [
      ["#2f5eff", "#ff7a45", "#2347d6"],
      ["#7c3aed", "#a3e635", "#6425c9"],
      ["#059669", "#f59e0b", "#047a54"],
      ["#e11d48", "#06b6d4", "#b3123a"]
    ];
    var idx = accents[accentIndex] ? Number(accentIndex) : 0;
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    var root = document.documentElement.style;
    root.setProperty("--accent", accents[idx][0]);
    root.setProperty("--accent-2", accents[idx][1]);
    root.setProperty("--accent-dim", accents[idx][2]);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="dot-grid">{children}</body>
    </html>
  );
}

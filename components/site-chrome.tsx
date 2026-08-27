"use client";

import dynamic from "next/dynamic";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

const ScrollScene = dynamic(() => import("@/components/scroll-scene").then((m) => m.ScrollScene), {
  ssr: false,
});

/** Split out so it can read the theme context its own parent provides. */
function Chrome({ children }: { children: React.ReactNode }) {
  const { theme, accent } = useTheme();

  return (
    <>
      <SmoothScroll />
      <ScrollScene theme={theme} accent={accent.accent} />
      <Grain />
      <Cursor />
      <Nav />
      {/* Lifted above the fixed 3D layer, which sits at z-0 over the body
          background. The sections are transparent, so it shows through them. */}
      <div className="relative z-10">
        {children}
        <Footer />
      </div>
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Chrome>{children}</Chrome>
    </ThemeProvider>
  );
}

"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { AuroraBackground } from "@/components/aurora-background";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme-provider";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SmoothScroll />
      <AuroraBackground />
      <Grain />
      <Cursor />
      <Nav />
      {/* Lifted above the fixed aurora layer, which sits at z-0 over the body
          background. The sections are transparent, so it shows through them. */}
      <div className="relative z-10">
        {children}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

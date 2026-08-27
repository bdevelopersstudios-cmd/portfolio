"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { AuroraBackground } from "@/components/aurora-background";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme-provider";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Template previews are the product being sold, so they get the viewport to
  // themselves — none of this site's nav, cursor, grain or background, which
  // would otherwise read as part of what the buyer is looking at.
  if (pathname?.startsWith("/templates/preview")) {
    return <>{children}</>;
  }

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

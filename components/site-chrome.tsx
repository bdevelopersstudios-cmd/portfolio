"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { Backdrop } from "@/components/backdrop";
import { Assistant } from "@/components/assistant/chat";
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
      <Backdrop />
      <Grain />
      <Cursor />
      <Nav />
      {/* Inside SiteChrome, so it is absent from template previews — those are
          the product being sold and should not carry this site's chrome. */}
      <Assistant />
      {/* Lifted above the fixed backdrop, which sits at z-0 over the body. */}
      <div className="relative z-10">
        {children}
        <Footer />
      </div>
    </ThemeProvider>
  );
}

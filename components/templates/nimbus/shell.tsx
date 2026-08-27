"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/**
 * Nimbus — marketing shell.
 *
 * Glassmorphism is confined to the navigation bar. `backdrop-filter` is the
 * single most expensive property on the page, and teams that spread it across
 * every card measured 15-30% frame-rate drops on mid-tier Android. One
 * element earns it; the rest are solid panels.
 */

export const T = {
  bg: "#07080d",
  panel: "#0e1018",
  panelAlt: "#141726",
  panelEdge: "rgba(255,255,255,0.08)",
  ink: "#f4f5f8",
  inkDim: "rgba(244,245,248,0.62)",
  inkFaint: "rgba(244,245,248,0.38)",
  brand: "#6366f1",
  brand2: "#a855f7",
  warm: "#f59e0b",
  good: "#34d399",
};

export const BASE = "/templates/preview/nimbus";

const NAV = [
  { label: "Product", href: `${BASE}/product` },
  { label: "Pricing", href: `${BASE}/pricing` },
  { label: "Changelog", href: `${BASE}/changelog` },
  { label: "Docs", href: `${BASE}/docs` },
];

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    // className lands here because this wrapper is the grid child — a
    // col-span on the card inside it would do nothing.
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Logo({ size = 7 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-bold text-white"
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        fontSize: `${size * 1.9}px`,
        background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})`,
      }}
    >
      N
    </span>
  );
}

export function NimbusShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ background: T.bg, color: T.ink }} className="min-h-screen font-sans antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(60vw 50vw at 78% -8%, ${T.brand}44, transparent 62%),
                       radial-gradient(52vw 44vw at 8% 18%, ${T.brand2}33, transparent 64%),
                       radial-gradient(46vw 40vw at 52% 104%, ${T.warm}22, transparent 62%)`,
        }}
      />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b" style={{ borderColor: T.panelEdge }}>
          <div className="backdrop-blur-xl" style={{ background: "rgba(7,8,13,0.62)" }}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <Link href={BASE} className="flex items-center gap-2.5">
                <Logo />
                <span className="text-[15px] font-semibold tracking-tight">Nimbus</span>
              </Link>

              <nav className="hidden items-center gap-7 text-[13px] md:flex" style={{ color: T.inkDim }}>
                {NAV.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="transition-colors hover:text-white"
                    style={{ color: pathname?.startsWith(l.href) ? T.ink : undefined }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2.5">
                <Link href={`${BASE}/login`} className="hidden text-[13px] sm:block" style={{ color: T.inkDim }}>
                  Sign in
                </Link>
                <Link
                  href={`${BASE}/app`}
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
                >
                  Open app
                </Link>
              </div>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t" style={{ borderColor: T.panelEdge }}>
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 pb-24 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo />
                <span className="text-[15px] font-semibold tracking-tight">Nimbus</span>
              </div>
              <p className="mt-3 max-w-xs text-[13px]" style={{ color: T.inkDim }}>
                Auth, billing and usage metering for teams who would rather build
                the product than the invoice table.
              </p>
            </div>
            {[
              { head: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { head: "Developers", links: ["Docs", "API reference", "Status", "SDKs"] },
              { head: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.head}>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                  {col.head}
                </h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13px] transition-colors hover:text-white" style={{ color: T.inkDim }}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="mx-auto max-w-6xl px-5 pb-20 text-[12px] sm:px-8"
            style={{ color: T.inkFaint, borderTop: `1px solid ${T.panelEdge}`, paddingTop: 20 }}
          >
            © 2026 Nimbus Labs. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

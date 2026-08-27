"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Atelier — studio shell.
 *
 * Warm earth palette rather than the saturated direction: of the two colour
 * stories 2026 settled into, this is the one that holds up under long-form
 * reading, which is most of what a studio site is.
 */
export const T = {
  bg: "#faf6f1",
  ink: "#1c1917",
  inkDim: "#57534e",
  inkFaint: "#a8a29e",
  line: "#e7e0d7",
  rust: "#c2410c",
  teal: "#0f766e",
  sand: "#efe7dc",
};

export const BASE = "/templates/preview/atelier";

const NAV = [
  { label: "Work", href: `${BASE}/work` },
  { label: "Studio", href: `${BASE}/studio` },
  { label: "Journal", href: `${BASE}/journal` },
  { label: "Contact", href: `${BASE}/contact` },
];

export function AtelierShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ background: T.bg, color: T.ink }} className="min-h-screen font-sans antialiased">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href={BASE} className="text-[15px] font-semibold tracking-tight">
          Atelier&nbsp;Nord
        </Link>
        <nav className="hidden gap-8 text-[13.5px] sm:flex" style={{ color: T.inkDim }}>
          {NAV.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-black"
              style={{ color: pathname?.startsWith(l.href) ? T.ink : undefined }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href={`${BASE}/contact`}
          className="rounded-full px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: T.ink }}
        >
          Start a project
        </Link>
      </header>

      {children}

      <footer className="mx-auto max-w-6xl px-5 py-16 pb-28 sm:px-8" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
              Say hello
            </p>
            <a
              href="#"
              className="mt-3 block text-[clamp(1.6rem,4.5vw,3rem)] font-semibold tracking-[-0.03em] transition-colors"
              style={{ color: T.ink }}
            >
              studio@ateliernord.nl
            </a>
          </div>
          <div className="text-[13px]" style={{ color: T.inkDim }}>
            <p>Schiedamse Vest 154</p>
            <p>3011 BH Rotterdam</p>
            <p className="mt-3" style={{ color: T.inkFaint }}>
              © 2026 Atelier Nord
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

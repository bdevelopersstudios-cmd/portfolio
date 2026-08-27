"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { useTheme } from "@/components/theme-provider";

const sectionLinks = [
  { hash: "work", label: "Work" },
  { hash: "experience", label: "Experience" },
  { hash: "skills", label: "Skills" },
  { hash: "contact", label: "Contact" },
];

/**
 * Conventional controls for the two things the hero's laptop and spark also
 * do. Clicking the laptop should be a discovery, not the only way in — these
 * are reachable by keyboard and exist on pages that have no 3D scene at all.
 */
function ThemeControls({ className = "" }: { className?: string }) {
  const { theme, accent, toggleTheme, cycleAccent } = useTheme();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={cycleAccent}
        data-cursor-hover
        aria-label={`Accent colour: ${accent.name}. Change it`}
        title="Change accent colour"
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink/5"
      >
        <span className="h-3.5 w-3.5 rounded-full bg-accent ring-1 ring-inset ring-ink/15" />
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        data-cursor-hover
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-ink/5 hover:text-ink"
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path
              strokeLinecap="round"
              d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7L5.4 5.4"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionHref = (hash: string) => (isHome ? `#${hash}` : `/#${hash}`);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-line-soft bg-bg/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" data-cursor-hover className="font-display text-lg tracking-tight text-ink">
          U<span className="text-accent">.</span>Saud
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim lg:flex">
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              href={sectionHref(link.hash)}
              data-cursor-hover
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tools"
            data-cursor-hover
            className={`transition-colors hover:text-accent ${pathname?.startsWith("/tools") ? "text-accent" : ""}`}
          >
            Tools
          </Link>
          <Link
            href="/templates"
            data-cursor-hover
            // Matched on its own path, not on "anywhere but home" — that older
            // test lit Templates up on /tools as well.
            className={`transition-colors hover:text-accent ${
              pathname?.startsWith("/templates") ? "text-accent" : ""
            }`}
          >
            Templates
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <a
            href={`mailto:${profile.email}`}
            data-cursor-hover
            className="hidden font-mono text-xs uppercase tracking-[0.15em] text-ink-dim transition-colors hover:text-accent lg:block"
          >
            {profile.email}
          </a>

          <ThemeControls />

          <button
            data-cursor-hover
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1.5 pl-1 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span
              className={`h-px w-6 bg-ink transition-transform ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-ink transition-transform ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-1 overflow-hidden border-t border-line-soft bg-bg px-6 pb-6 font-mono text-sm uppercase tracking-[0.15em] text-ink-dim lg:hidden"
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              href={sectionHref(link.hash)}
              onClick={() => setOpen(false)}
              className="border-b border-line-soft py-4"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={() => setOpen(false)}
            className="border-b border-line-soft py-4"
          >
            Tools
          </Link>
          <Link
            href="/templates"
            onClick={() => setOpen(false)}
            className="border-b border-line-soft py-4"
          >
            Templates
          </Link>
        </motion.nav>
      )}
    </motion.header>
  );
}

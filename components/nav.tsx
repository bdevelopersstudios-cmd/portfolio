"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { profile } from "@/lib/data";

const sectionLinks = [
  { hash: "work", label: "Work" },
  { hash: "experience", label: "Experience" },
  { hash: "skills", label: "Skills" },
  { hash: "contact", label: "Contact" },
];

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
  // The homepage hero is a fixed dark scene regardless of the site's own
  // light/dark toggle, so the nav needs light text there specifically —
  // once scrolled (or off the homepage entirely) it's over the normal
  // theme-driven background and can use the normal theme-driven colors.
  const overDarkHero = isHome && !scrolled;

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
        <Link
          href="/"
          data-cursor-hover
          className={`font-display text-lg tracking-tight ${overDarkHero ? "text-white" : ""}`}
        >
          U<span className="text-accent">.</span>Saud
        </Link>

        <nav
          className={`hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.15em] md:flex ${
            overDarkHero ? "text-white/70" : "text-ink-dim"
          }`}
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              href={sectionHref(link.hash)}
              data-cursor-hover
              className={`transition-colors ${overDarkHero ? "hover:text-white" : "hover:text-accent"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/templates"
            data-cursor-hover
            className={`transition-colors ${overDarkHero ? "hover:text-white" : "hover:text-accent"} ${
              !isHome ? "text-accent" : ""
            }`}
          >
            Templates
          </Link>
        </nav>

        <a
          href={`mailto:${profile.email}`}
          data-cursor-hover
          className={`hidden font-mono text-xs uppercase tracking-[0.15em] transition-colors md:block ${
            overDarkHero ? "text-white/70 hover:text-white" : "text-ink-dim hover:text-accent"
          }`}
        >
          {profile.email}
        </a>

        <button
          data-cursor-hover
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-px w-6 transition-transform ${overDarkHero ? "bg-white" : "bg-ink"} ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 transition-transform ${overDarkHero ? "bg-white" : "bg-ink"} ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-1 overflow-hidden border-t border-line-soft bg-bg px-6 pb-6 font-mono text-sm uppercase tracking-[0.15em] text-ink-dim md:hidden"
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

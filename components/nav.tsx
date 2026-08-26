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
        <Link href="/" data-cursor-hover className="font-display text-lg tracking-tight">
          U<span className="text-accent">.</span>Saud
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim md:flex">
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
            href="/templates"
            data-cursor-hover
            className={`transition-colors hover:text-accent ${!isHome ? "text-accent" : ""}`}
          >
            Templates
          </Link>
        </nav>

        <a
          href={`mailto:${profile.email}`}
          data-cursor-hover
          className="hidden font-mono text-xs uppercase tracking-[0.15em] text-ink-dim transition-colors hover:text-accent md:block"
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
            className={`h-px w-6 bg-ink transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
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

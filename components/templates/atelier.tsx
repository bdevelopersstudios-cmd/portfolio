"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Atelier — an editorial studio site.
 *
 * Warm earth palette rather than the saturated "dopamine" direction: of the
 * two 2026 colour stories, this is the one that holds up under long-form
 * reading, which is most of what a studio site is.
 *
 * The kinetic headline animates per word on load and the marquee runs
 * continuously — both are gated on reduced-motion, since a permanently
 * moving band of text is exactly what that setting exists for.
 */
const T = {
  bg: "#faf6f1",
  ink: "#1c1917",
  inkDim: "#57534e",
  inkFaint: "#a8a29e",
  line: "#e7e0d7",
  rust: "#c2410c",
  teal: "#0f766e",
  sand: "#efe7dc",
};

const HEADLINE = ["Design", "that", "earns", "its", "keep."];

const MARQUEE = [
  "Brand systems",
  "Editorial design",
  "Product UI",
  "Art direction",
  "Motion",
  "Packaging",
];

type Project = {
  title: string;
  client: string;
  year: string;
  discipline: "Brand" | "Digital" | "Print";
  note: string;
};

const PROJECTS: Project[] = [
  { title: "Sable & Co", client: "Sable", year: "2026", discipline: "Brand", note: "Identity, packaging and a 96-page standards manual for a third-wave roaster." },
  { title: "Marginalia", client: "Verso Press", year: "2026", discipline: "Print", note: "A quarterly literary journal, typeset in Freight with a two-colour spot system." },
  { title: "Northbound", client: "Northbound Rail", year: "2025", discipline: "Digital", note: "Wayfinding and a booking flow that survived a 40-station rollout." },
  { title: "Ferrous", client: "Ferrous Tools", year: "2025", discipline: "Brand", note: "A workshop brand built to be stamped, etched and screen-printed." },
  { title: "Halcyon", client: "Halcyon Studio", year: "2024", discipline: "Digital", note: "Portfolio and CMS for a photography studio shooting on medium format." },
  { title: "Pressfold", client: "Pressfold", year: "2024", discipline: "Print", note: "A monograph series with a French-fold cover and exposed binding." },
];

const FILTERS = ["All", "Brand", "Digital", "Print"] as const;

export function Atelier() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.discipline === filter)),
    [filter]
  );

  return (
    <div style={{ background: T.bg, color: T.ink }} className="min-h-screen font-sans antialiased">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <span className="text-[15px] font-semibold tracking-tight">Atelier&nbsp;Nord</span>
        <nav className="hidden gap-8 text-[13.5px] sm:flex" style={{ color: T.inkDim }}>
          {["Work", "Studio", "Journal", "Contact"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-black">
              {l}
            </a>
          ))}
        </nav>
        <a
          href="#"
          className="rounded-full px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: T.ink }}
        >
          Start a project
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        {/* Kinetic headline: each word rises on load. */}
        <h1 className="text-[clamp(3rem,11vw,9rem)] font-semibold leading-[0.86] tracking-[-0.04em]">
          {HEADLINE.map((word, i) => (
            // pb here is load-bearing: the mask is overflow-hidden, and at this
            // line-height the descenders of `g` and `p` fall outside it.
            <span key={word} className="inline-block overflow-hidden pb-[0.14em] pr-[0.22em] align-bottom">
              <motion.span
                className="inline-block"
                initial={reduced ? false : { y: "110%" }}
                animate={reduced ? undefined : { y: "0%" }}
                transition={{ duration: 0.75, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                style={i === 3 ? { color: T.rust, fontStyle: "italic" } : undefined}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-lg text-[17px] leading-relaxed" style={{ color: T.inkDim }}>
            An independent studio in Rotterdam working on identity, editorial and
            product. We take a small number of projects a year and stay on them
            until they are actually finished.
          </p>
          <dl className="flex gap-10">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                Since
              </dt>
              <dd className="mt-1 text-[24px] font-semibold tracking-tight">2014</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                Projects
              </dt>
              <dd className="mt-1 text-[24px] font-semibold tracking-tight">140+</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Marquee. Duplicated once so the loop has no visible seam. */}
      <div
        className="group overflow-hidden border-y py-4"
        style={{ borderColor: T.line, background: T.sand }}
      >
        <div
          className="flex w-max gap-10 whitespace-nowrap"
          style={{
            animation: reduced ? undefined : "atelier-marquee 34s linear infinite",
          }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-10" aria-hidden={dup === 1}>
              {MARQUEE.map((m) => (
                <span key={m} className="flex items-center gap-10 text-[22px] tracking-tight sm:text-[30px]">
                  {m}
                  {/* A drawn dot rather than a glyph: ✳ and friends resolve to
                      a colour emoji on most platforms and break the palette. */}
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ background: T.rust }}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]">
            Selected work
          </h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={on}
                  className="rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors"
                  style={{
                    borderColor: on ? T.ink : T.line,
                    background: on ? T.ink : "transparent",
                    color: on ? T.bg : T.inkDim,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="mt-10 border-t" style={{ borderColor: T.line }}>
          {shown.map((p, i) => {
            const isOpen = open === p.title;
            return (
              <motion.li
                key={p.title}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.04 }}
                className="border-b"
                style={{ borderColor: T.line }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : p.title)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-baseline gap-4 py-6 text-left transition-colors sm:gap-8"
                >
                  <span
                    className="font-mono text-[11px] tabular-nums"
                    style={{ color: T.inkFaint }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[clamp(1.4rem,3.4vw,2.4rem)] font-medium tracking-[-0.02em] transition-colors group-hover:text-[color:var(--rust)]" style={{ ["--rust" as string]: T.rust }}>
                    {p.title}
                  </span>
                  <span className="hidden text-[13px] sm:block" style={{ color: T.inkDim }}>
                    {p.discipline}
                  </span>
                  <span className="font-mono text-[12px] tabular-nums" style={{ color: T.inkFaint }}>
                    {p.year}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[18px] transition-transform"
                    style={{ color: T.inkFaint, transform: isOpen ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <motion.div
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 pb-8 sm:grid-cols-[1fr_1fr] sm:pl-12">
                      <p className="max-w-md text-[15px] leading-relaxed" style={{ color: T.inkDim }}>
                        {p.note}
                      </p>
                      <div
                        className="flex h-40 items-end rounded-lg p-5"
                        style={{
                          background: `linear-gradient(135deg, ${T.sand}, ${i % 2 ? T.teal : T.rust}22)`,
                        }}
                      >
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkDim }}>
                          {p.client} · {p.year}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </section>

      <section
        className="border-y"
        style={{ borderColor: T.line, background: T.sand }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-[0.9fr_1.1fr] sm:px-8 sm:py-24">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.02em]">
            We work in the open, and we finish what we start.
          </h2>
          <div className="space-y-5 text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
            <p>
              Every project runs from a shared board you can see at any hour. No
              status meetings to find out where things are, and no reveal at the
              end that turns out to be the first honest conversation.
            </p>
            <p>
              We price in phases, and each phase ends with something you own
              outright — files, fonts, source, rights. If we stop after phase one,
              you still have phase one.
            </p>
            <a
              href="#"
              className="inline-block border-b pb-1 text-[15px] font-medium transition-colors"
              style={{ borderColor: T.rust, color: T.rust }}
            >
              Read how we work →
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-16 pb-28 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
              Say hello
            </p>
            <a
              href="#"
              className="mt-3 block text-[clamp(1.6rem,4.5vw,3rem)] font-semibold tracking-[-0.03em] transition-colors hover:text-[color:var(--rust)]"
              style={{ ["--rust" as string]: T.rust }}
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

      <style>{`
        @keyframes atelier-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .group:hover [style*="atelier-marquee"] { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

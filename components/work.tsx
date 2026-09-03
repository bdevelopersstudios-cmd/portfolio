"use client";

import { motion, useReducedMotion } from "motion/react";
import { CodeField } from "@/components/code-field";
import { work } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

/**
 * Each project gets its own colour pair, so the three read as distinct pieces
 * rather than three copies of the same card. There are no screenshots to show,
 * so the identity has to be generated — a gradient plus the index numeral
 * standing in for the image a case study would normally lead with.
 */
const IDENTITY = [
  { from: "var(--accent)", to: "#22d3ee", tag: "Platform" },
  { from: "#a855f7", to: "var(--accent)", tag: "Billing" },
  { from: "var(--accent-2)", to: "#f59e0b", tag: "Performance" },
];

export function Work() {
  const reduced = useReducedMotion();

  return (
    <section id="work" className="tone tone-ink border-b border-line-soft py-28 sm:py-36">
      <CodeField motif="graph" align="left" />
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading
          index="01"
          label="Selected Work"
          title="One platform. Three problems worth showing."
          lede="A weather-and-scheduling platform built solo, end to end — broken into the three parts most worth a closer look."
        />

        <div className="mt-16 flex flex-col gap-5">
          {work.map((item, i) => {
            const id = IDENTITY[i % IDENTITY.length];
            // Alternating sides give the column a rhythm; three identical
            // stacked rows was the flattest part of the page.
            const flip = i % 2 === 1;

            return (
              <motion.article
                key={item.index}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="glass glass-lit lift group overflow-hidden rounded-2xl"
              >
                {/* One grid definition per card, chosen outright. Concatenating
                    two `lg:grid-cols-*` classes leaves both in the stylesheet
                    and lets source order decide the winner, which made the
                    flip land on the wrong side. */}
                <div
                  className={
                    flip
                      ? "grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)]"
                      : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_15rem]"
                  }
                >
                  {/* A slim identity strip — gradient, label, numeral. The
                      copy all lives in the wide column, so nothing long ever
                      has to wrap inside 15rem. */}
                  <div
                    className={`relative flex min-h-[7rem] items-end justify-between overflow-hidden p-7 lg:flex-col lg:items-start ${
                      flip ? "lg:order-first" : "lg:order-last"
                    }`}
                    style={{
                      background: `linear-gradient(150deg, color-mix(in oklab, ${id.from} 30%, transparent), color-mix(in oklab, ${id.to} 22%, transparent))`,
                    }}
                  >
                    <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
                      {id.tag}
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative select-none font-display text-[5rem] leading-[0.8] tracking-tighter text-ink opacity-[0.16] transition-opacity duration-500 group-hover:opacity-30 lg:mt-auto lg:text-[7rem]"
                    >
                      {item.index}
                    </span>
                  </div>

                  <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-px w-8"
                        style={{ background: `linear-gradient(90deg, ${id.from}, transparent)` }}
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                        {item.index} / {String(work.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-3xl leading-[1.08] text-balance sm:text-4xl">
                      {item.title}
                    </h3>

                    <p className="mt-5 max-w-2xl leading-relaxed text-ink-dim">{item.description}</p>

                    <ul className="mt-7 grid gap-3 border-t border-line-soft pt-6 sm:grid-cols-2">
                      {item.points.map((point, idx) => (
                        <li key={idx} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-dim">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                            style={{ background: id.from }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex flex-wrap gap-2">
                      {item.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-dim transition-colors group-hover:border-ink-faint"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

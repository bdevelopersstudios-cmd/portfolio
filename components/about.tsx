"use client";

import { motion, useReducedMotion } from "motion/react";
import { CodeField } from "@/components/code-field";
import { about, profile } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

/** Pulled out of the prose so the section leads with proof rather than paragraphs. */
const MARKERS = [
  { value: "2022", label: "Shipping since" },
  { value: "976", label: "Pages live" },
  { value: "97%", label: "Weight removed" },
];

export function About() {
  const reduced = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    whileInView: reduced ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="about" className="tone tone-bone border-b border-line-soft py-28 sm:py-36">
      <CodeField motif="file" align="right" />
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading index="00" label="About" title="Ships product, not just code." />

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* The first paragraph is set noticeably larger than the second. The
              two were the same size before, which gave the block no entry
              point and made it read as one undifferentiated wall. */}
          <motion.div {...rise(0)} className="lg:col-span-7">
            <div className="glass glass-lit h-full rounded-2xl p-8 sm:p-10">
              <p className="font-display text-2xl leading-[1.35] text-balance sm:text-[1.75rem]">
                {about.paragraphs[0]}
              </p>
              {about.paragraphs[1] && (
                <p className="mt-6 border-t border-line-soft pt-6 text-[17px] leading-relaxed text-ink-dim">
                  {about.paragraphs[1]}
                </p>
              )}
            </div>
          </motion.div>

          <div className="grid gap-5 lg:col-span-5">
            <motion.div {...rise(0.08)}>
              <div className="glass lift rounded-2xl p-7">
                <div className="grid grid-cols-3 gap-4">
                  {MARKERS.map((m) => (
                    <div key={m.label}>
                      <div className="font-display text-3xl leading-none text-accent sm:text-4xl">
                        {m.value}
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-ink-faint">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div {...rise(0.14)}>
              <dl className="glass lift divide-y divide-line-soft rounded-2xl px-7 py-2">
                {about.facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
                      {fact.label}
                    </dt>
                    <dd className="text-right font-display text-[17px]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.div {...rise(0.2)}>
              <a
                href={`mailto:${profile.email}`}
                data-cursor-hover
                className="glass lift group flex items-center justify-between gap-4 rounded-2xl px-7 py-5"
              >
                <span>
                  <span className="block font-display text-[17px]">Available for new work</span>
                  <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    Project or long-term
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-xl text-accent transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

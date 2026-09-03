"use client";

import { motion, useReducedMotion } from "motion/react";
import { skillGroups } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

const marqueeItems = skillGroups.flatMap((g) => g.skills);

/**
 * The daily stack, called out by name. Four columns of identically-weighted
 * text said nothing about what he actually reaches for first — these get the
 * emphasis, everything else sits behind them.
 */
const PRIMARY = new Set(["React.js", "Next.js", "Supabase", "PostgreSQL", "Stripe", "Cloudflare Workers"]);

/** A short note per group, so each block says why it exists rather than just listing. */
const GROUP_NOTES: Record<string, string> = {
  Frontend: "Where most of the work lands — components, state, and the animation on top.",
  "Backend & Data": "Schema, triggers and the enforcement that has to survive a direct API call.",
  "Infra & Payments": "Edge runtime and billing — the parts that cost money when they go wrong.",
  "No-Code & Design": "Two certifications and a Figma pipeline, which is the unusual half.",
};

export function Skills() {
  const reduced = useReducedMotion();

  return (
    <section id="skills" className="border-b border-line-soft py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading
          index="04"
          label="Skills"
          title="The stack, end to end."
          lede="Front of the app to the database trigger underneath it — and the no-code side most developers do not carry."
        />
      </div>

      <div className="relative mt-16 overflow-hidden border-y border-line-soft py-5">
        <div className="marquee-track flex w-max gap-10 font-display text-3xl text-ink-faint sm:text-4xl">
          {[...marqueeItems, ...marqueeItems].map((s, i) => (
            <span key={i} className="flex items-center gap-10">
              {s}
              <span className="text-accent">&bull;</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        {/* Asymmetric on purpose: two wide cells then two narrow, so the block
            stops reading as four identical columns of list. */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {skillGroups.map((group, i) => {
            const wide = i < 2;
            return (
              <motion.div
                key={group.label}
                initial={reduced ? false : { opacity: 0, y: 22 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={wide ? "lg:col-span-3" : "lg:col-span-2"}
              >
                <div className="glass glass-lit lift h-full rounded-2xl p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                      {group.label}
                    </h3>
                    <span className="font-mono text-[11px] text-ink-faint">
                      {String(group.skills.length).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                    {GROUP_NOTES[group.label]}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {group.skills.map((skill) => {
                      const primary = PRIMARY.has(skill);
                      return (
                        <li
                          key={skill}
                          className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                            primary
                              ? "bg-accent/10 font-medium text-accent ring-1 ring-inset ring-accent/25"
                              : "border border-line text-ink-dim hover:border-ink-faint hover:text-ink"
                          }`}
                        >
                          {skill}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
          <span className="h-2 w-2 rounded-full bg-accent/30 ring-1 ring-inset ring-accent/40" />
          Highlighted items are the daily stack
        </p>
      </div>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { about } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

export function About() {
  return (
    <section id="about" className="border-b border-line-soft py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading index="00" label="About" title="Ships product, not just code." />

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {about.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="max-w-2xl text-xl leading-relaxed text-ink-dim text-balance sm:text-2xl"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="divide-y divide-line-soft border-y border-line-soft self-start"
          >
            {about.facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
                  {fact.label}
                </dt>
                <dd className="text-right font-display text-lg">{fact.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

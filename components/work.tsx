"use client";

import { motion } from "motion/react";
import { work } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { TiltCard } from "@/components/tilt-card";

export function Work() {
  return (
    <section id="work" className="border-b border-line-soft py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            index="01"
            label="Selected Work"
            title="One platform. Three problems worth showing."
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xs text-sm text-ink-faint"
          >
            A weather-and-scheduling platform built solo, end to end — broken
            into the three parts most worth a closer look.
          </motion.p>
        </div>

        <div className="mt-16 flex flex-col gap-6">
          {work.map((item, i) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <TiltCard>
                {/* Opaque, not translucent: the 3D layer scrolls behind the
                    page now, and showing it through the densest block of copy
                    on the site made both harder to read. */}
                <div className="relative overflow-hidden border border-line bg-bg-raised p-8 sm:p-12">
                  <span className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[9rem] leading-none text-black/[0.035] sm:text-[12rem]">
                    {item.index}
                  </span>

                  <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                        {item.index}
                      </span>
                      <h3 className="mt-3 font-display text-3xl sm:text-4xl text-balance">
                        {item.title}
                      </h3>
                      <p className="mt-5 max-w-xl text-ink-dim leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {item.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-dim"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ul className="flex flex-col gap-4 border-t border-line-soft pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      {item.points.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-sm leading-relaxed text-ink-dim">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

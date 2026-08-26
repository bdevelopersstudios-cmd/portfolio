"use client";

import { motion } from "motion/react";
import { skillGroups } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

const marqueeItems = skillGroups.flatMap((g) => g.skills);

export function Skills() {
  return (
    <section id="skills" className="border-b border-line-soft py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading index="03" label="Skills" title="The stack, end to end." />
      </div>

      <div className="relative mt-14 overflow-hidden border-y border-line-soft py-5">
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
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {group.label}
              </h4>
              <ul className="mt-5 flex flex-col gap-3 border-t border-line-soft pt-5">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="font-display text-lg text-ink-dim transition-colors hover:text-ink"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

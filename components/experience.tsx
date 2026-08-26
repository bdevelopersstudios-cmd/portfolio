"use client";

import { motion } from "motion/react";
import { experience, education, certifications } from "@/lib/data";
import { SectionHeading } from "@/components/section-heading";

export function Experience() {
  return (
    <section id="experience" className="border-b border-line-soft py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <SectionHeading index="03" label="Experience" title="Four years, four very different rooms." />

        <div className="relative mt-16">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line sm:left-[189px]" />

          <div className="flex flex-col gap-14">
            {experience.map((item, i) => (
              <motion.div
                key={item.company + item.period}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="relative grid grid-cols-1 gap-4 pl-8 sm:grid-cols-[190px_1fr] sm:gap-0 sm:pl-0"
              >
                <span className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg sm:left-[182px]" />

                <div className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.03em] text-ink-faint sm:pt-1 sm:pr-7 sm:text-right">
                  {item.period}
                </div>

                <div className="sm:pl-10">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-2xl sm:text-3xl">{item.role}</h3>
                    <span className="font-mono text-sm text-accent">{item.company}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-faint">
                    {item.location}
                  </p>
                  <p className="mt-4 max-w-2xl text-ink-dim leading-relaxed">{item.summary}</p>
                  <ul className="mt-4 flex max-w-2xl flex-col gap-2.5">
                    {item.highlights.map((h, idx) => (
                      <li key={idx} className="flex gap-3 text-sm leading-relaxed text-ink-dim">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 grid grid-cols-1 gap-10 border-t border-line-soft pt-12 sm:grid-cols-2"
        >
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Education</h4>
            <p className="mt-3 font-display text-xl">{education.school}</p>
            <p className="mt-1 text-sm text-ink-dim">{education.degree}</p>
            <p className="mt-1 font-mono text-xs text-ink-faint">{education.period}</p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              Certifications
            </h4>
            <ul className="mt-3 flex flex-col gap-2">
              {certifications.map((c, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-ink-dim">
                    {c.title} <span className="text-ink-faint">— {c.issuer}</span>
                  </span>
                  <span className="font-mono text-xs text-ink-faint">{c.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

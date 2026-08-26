"use client";

import { motion } from "motion/react";
import { categoryLabels, type Template } from "@/lib/templates";
import { TiltCard } from "@/components/tilt-card";

export function TemplateCard({ template, index }: { template: Template; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <TiltCard>
        <div className="flex h-full flex-col overflow-hidden border border-line bg-bg-raised/60">
          <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-line bg-bg-raised-2">
            <span className="select-none whitespace-nowrap font-display text-6xl font-medium uppercase leading-none text-black/[0.06]">
              {categoryLabels[template.category]}
            </span>
            <span className="absolute left-4 top-4 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-dim">
              {categoryLabels[template.category]}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-2xl">{template.name}</h3>
            <p className="mt-2 text-sm text-ink-dim">{template.tagline}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-dim">{template.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {template.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-dim"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line-soft pt-5">
              <span className="font-display text-xl">${template.price}</span>
              <span className="rounded-full border border-line-soft px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

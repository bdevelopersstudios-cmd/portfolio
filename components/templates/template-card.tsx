"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { categoryLabels, type Template } from "@/lib/templates";
import { TiltCard } from "@/components/tilt-card";

export function TemplateCard({ template, index }: { template: Template; index: number }) {
  const [from, to] = template.swatch;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <TiltCard>
        <div className="flex h-full flex-col overflow-hidden border border-line bg-bg-raised">
          {/* Each template gets its own colour, so the three read as distinct
              products rather than three versions of one. */}
          <Link
            href={template.previewPath}
            className="relative block h-44 overflow-hidden border-b border-line"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            aria-label={`Open the ${template.name} live preview`}
          >
            <span className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: "radial-gradient(60% 60% at 30% 20%, #fff, transparent 70%)" }} />
            <span className="absolute left-5 top-5 rounded-full border border-white/35 bg-black/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
              {categoryLabels[template.category]}
            </span>
            <span className="absolute bottom-5 left-5 font-display text-3xl text-white drop-shadow-sm">
              {template.name}
            </span>
            <span className="absolute bottom-5 right-5 rounded-full bg-white/95 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-black">
              Live preview →
            </span>
          </Link>

          <div className="flex flex-1 flex-col p-6">
            <p className="text-sm text-ink-dim">{template.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">{template.description}</p>

            {/* The screen list is the clearest answer to "what am I buying" —
                more so than a feature list, since every one is clickable. */}
            <div className="mt-5 border-t border-line-soft pt-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                {template.pages.length} screens
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {template.pages.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-dim"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <ul className="mt-5 space-y-2 border-t border-line-soft pt-5">
              {template.includes.slice(0, 3).map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-dim">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                    style={{ background: from }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-5">
              <span className="font-display text-xl">
                ${template.price.toLocaleString()}
              </span>
              <Link
                href={template.previewPath}
                data-cursor-hover
                className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-accent hover:text-accent"
              >
                View live
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

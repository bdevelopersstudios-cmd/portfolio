"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const STATS = [
  { value: "976", label: "Dynamic city pages generated and shipped" },
  { value: "9", label: "Production database migrations applied to a live app" },
  { value: "97%", label: "Asset weight cut on the heaviest page — 28MB to 0.72MB" },
  { value: "6", label: "Pricing tiers, fully feature-gated at the database" },
];

type Progress = ReturnType<typeof useScroll>["scrollYProgress"];

// Adjacent stats crossfade against a shared boundary window instead of each
// fading to 0 independently — otherwise there's a beat where neither is
// visible right at the handoff.
function crossfadeRange(index: number, n: number) {
  const segment = 1 / n;
  const overlap = segment * 0.1;
  const start = index * segment;
  const end = start + segment;
  return [
    index === 0 ? 0 : start - overlap,
    start + overlap,
    end - overlap,
    index === n - 1 ? 1 : end + overlap,
  ];
}

function StatFrame({ index, progress }: { index: number; progress: Progress }) {
  const range = crossfadeRange(index, STATS.length);
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const scale = useTransform(progress, range, [0.9, 1, 1, 0.9]);

  return (
    <motion.span
      style={{ opacity, scale }}
      className="absolute inset-0 flex items-center justify-center font-display text-[clamp(4.5rem,13vw,8rem)] leading-none text-accent"
    >
      {STATS[index].value}
    </motion.span>
  );
}

function StatRow({ index, progress }: { index: number; progress: Progress }) {
  const range = crossfadeRange(index, STATS.length);
  const active = useTransform(progress, range, [0, 1, 1, 0]);
  const opacity = useTransform(active, [0, 1], [0.35, 1]);
  const x = useTransform(active, [0, 1], [0, 8]);

  return (
    <motion.div
      style={{ opacity, x }}
      className="flex items-baseline gap-4 border-b border-line-soft py-4"
    >
      <span className="font-mono text-xs text-ink-faint">0{index + 1}</span>
      <span className="font-display text-xl text-ink">{STATS[index].value}</span>
      <span className="text-sm text-ink-dim">{STATS[index].label}</span>
    </motion.div>
  );
}

export function Impact() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="impact" ref={wrapperRef} className="relative h-[220vh] border-b border-line-soft">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-6 sm:px-10 md:grid-cols-2 md:gap-16 lg:px-16">
          <div className="relative order-2 h-40 md:order-1">
            {STATS.map((_, i) => (
              <StatFrame key={i} index={i} progress={scrollYProgress} />
            ))}
          </div>

          <div className="order-1 md:order-2">
            <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
              <span>02</span>
              <span className="h-px w-8 bg-line" />
              <span>Impact</span>
            </div>
            <div>
              {STATS.map((_, i) => (
                <StatRow key={i} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

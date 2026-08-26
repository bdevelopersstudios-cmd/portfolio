"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const STATS = [
  {
    value: "976",
    label: "Dynamic city pages generated and shipped alongside the core product",
  },
  {
    value: "9",
    label: "Production database migrations applied directly to a live app",
  },
  {
    value: "97%",
    label: "Asset weight cut on the heaviest page — 28MB down to 0.72MB",
  },
  {
    value: "6",
    label: "Pricing tiers designed with full feature gating, enforced at the database",
  },
];

function StatFrame({
  index,
  progress,
}: {
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const n = STATS.length;
  const segment = 1 / n;
  const start = index * segment;
  const end = start + segment;
  const fade = segment * 0.18;

  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [0.92, 1, 1, 0.92]
  );

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
    >
      <span className="font-display text-[clamp(4rem,16vw,9rem)] leading-none text-accent">
        {STATS[index].value}
      </span>
      <span className="mt-4 max-w-md text-lg text-ink-dim text-balance">
        {STATS[index].label}
      </span>
    </motion.div>
  );
}

function ProgressDot({
  index,
  progress,
}: {
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const n = STATS.length;
  const segment = 1 / n;
  const start = index * segment;
  const end = start + segment;
  const opacity = useTransform(progress, [start, start + segment * 0.3, end], [0.25, 1, 0.25]);

  return <motion.span style={{ opacity }} className="h-1.5 w-1.5 rounded-full bg-accent" />;
}

export function Impact() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={wrapperRef} className="relative h-[400vh] border-b border-line-soft">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <div className="absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          <span>02</span>
          <span className="h-px w-8 bg-line" />
          <span>Impact</span>
        </div>

        <div className="relative h-64 w-full max-w-2xl">
          {STATS.map((_, i) => (
            <StatFrame key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>

        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
          {STATS.map((_, i) => (
            <ProgressDot key={i} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

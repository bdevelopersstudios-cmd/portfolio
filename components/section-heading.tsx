"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Section header.
 *
 * The index used to be 10px of grey mono text doing nothing. It is now an
 * outlined numeral set alongside the title — the page needed a structural
 * marker with some weight to break up six sections that otherwise open
 * identically, and this gives each one an anchor without adding another
 * competing headline.
 */
export function SectionHeading({
  index,
  label,
  title,
  lede,
  align = "left",
}: {
  index: string;
  label: string;
  title: string;
  /** Optional supporting line, set beside the title rather than beneath it. */
  lede?: string;
  align?: "left" | "right";
}) {
  const reduced = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    whileInView: reduced ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className={align === "right" ? "text-right" : ""}>
      <motion.div
        {...rise(0)}
        className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="uppercase">{label}</span>
        <span className="h-px w-10 bg-line" />
      </motion.div>

      <div
        className={`mt-5 flex items-start gap-5 sm:gap-8 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <motion.span
          {...rise(0.05)}
          aria-hidden="true"
          className="section-index hidden shrink-0 select-none pt-1 sm:block"
        >
          {index}
        </motion.span>

        <div className="min-w-0">
          <motion.h2
            {...rise(0.1)}
            className="font-display text-4xl leading-[1.02] text-balance sm:text-5xl md:text-6xl"
          >
            {title}
          </motion.h2>
          {lede && (
            <motion.p
              {...rise(0.16)}
              className="mt-5 max-w-xl text-lg leading-relaxed text-ink-dim text-balance"
            >
              {lede}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

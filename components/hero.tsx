"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { MagneticButton } from "@/components/magnetic-button";

const HeroScene = dynamic(() => import("@/components/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
});

const headlineWords = ["Full-stack", "products,", "built", "end", "to", "end."];

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden border-b border-line-soft"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-6 px-6 pt-32 pb-16 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:pt-40 lg:px-16">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-dim"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Available for new work &middot; {profile.location}
          </motion.div>

          <h1 className="font-display text-[clamp(2.75rem,9vw,5.2rem)] leading-[0.98] text-balance">
            {headlineWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 pr-[0.22em] align-bottom">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block ${word === "products," ? "text-accent" : ""}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-6 max-w-md text-lg text-ink-dim text-balance"
          >
            I&apos;m {profile.name} — a developer who takes a product from a Figma
            file through database migrations, without losing the seams in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="#work" variant="solid">
              View selected work
            </MagneticButton>
            <MagneticButton href="#contact" variant="outline">
              Get in touch
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative z-0 mx-auto h-[320px] w-full sm:h-[420px] md:h-[560px]">
          <HeroScene />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint sm:flex"
      >
        <span>Scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-ink-faint to-transparent" />
      </motion.div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { MagneticButton } from "@/components/magnetic-button";
import { useTheme } from "@/components/theme-provider";

const HeroScene = dynamic(() => import("@/components/hero-scene").then((m) => m.HeroScene), {
  ssr: false,
});

const headlineWords = ["Full-stack", "products,", "built", "end", "to", "end."];

export function Hero() {
  const { accent, hasDiscoveredLaptop, toggleTheme, cycleAccent } = useTheme();

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-[#081420]">
      <div id="hero-3d" className="absolute inset-0 z-0">
        <HeroScene
          accent={accent.accent}
          accent2={accent.accent2}
          showHint={!hasDiscoveredLaptop}
          onToggleTheme={toggleTheme}
          onCycleAccent={cycleAccent}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#081420] via-[#081420]/60 to-transparent"
      />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 py-28 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Available for new work &middot; {profile.location}
        </motion.div>

        <h1 className="font-display text-[clamp(2.75rem,9vw,5.2rem)] leading-[0.98] text-balance text-white">
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
          className="mt-5 max-w-md text-lg text-white/70 text-balance"
        >
          I&apos;m {profile.name} — a developer who takes a product from a Figma
          file through database migrations, without losing the seams in between.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4"
        >
          <MagneticButton href="#work" variant="solid">
            View selected work
          </MagneticButton>
          <MagneticButton href="#contact" variant="outline-light">
            Get in touch
          </MagneticButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: hasDiscoveredLaptop ? 1 : [1, 1.06, 1] }}
          transition={{
            opacity: { duration: 0.6, delay: 1.4 },
            scale: { duration: 1.6, repeat: hasDiscoveredLaptop ? 0 : Infinity, ease: "easeInOut" },
          }}
          className={`pointer-events-none mt-8 font-mono text-[11px] uppercase tracking-[0.15em] ${
            hasDiscoveredLaptop ? "text-white/40" : "font-semibold text-accent"
          }`}
        >
          {hasDiscoveredLaptop
            ? "Click the laptop for theme, the spark for accent"
            : "👆 It's interactive — try clicking it"}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex"
      >
        <span>Scroll</span>
        <span className="h-6 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}

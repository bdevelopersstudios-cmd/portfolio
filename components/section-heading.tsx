"use client";

import { motion } from "motion/react";

export function SectionHeading({
  index,
  label,
  title,
  align = "left",
}: {
  index: string;
  label: string;
  title: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className={`font-mono text-xs tracking-[0.2em] text-accent flex items-center gap-3 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <span className="text-ink-faint">{index}</span>
        <span className="h-px w-8 bg-line" />
        <span className="uppercase">{label}</span>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 text-balance"
      >
        {title}
      </motion.h2>
    </div>
  );
}

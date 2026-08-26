"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import { MagneticButton } from "@/components/magnetic-button";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the mailto link still works
    }
  };

  return (
    <section id="contact" className="py-28 sm:py-40">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          <span className="text-ink-faint">04</span>
          <span className="h-px w-8 bg-line" />
          <span>Contact</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl md:text-7xl"
        >
          Have something worth <span className="italic text-accent">building?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-lg text-lg text-ink-dim text-balance"
        >
          I take on a small number of freelance and contract builds at a time.
          If it involves React, Supabase, or turning a Figma file into
          something real, let&apos;s talk.
        </motion.p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <MagneticButton href={`mailto:${profile.email}`} variant="solid">
            {profile.email}
          </MagneticButton>
          <button
            onClick={copyEmail}
            data-cursor-hover
            className="rounded-full border border-line px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? "Copied" : "Copy email"}
          </button>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-line-soft pt-8 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
          <a href={profile.github} target="_blank" rel="noreferrer" data-cursor-hover className="hover:text-accent">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor-hover className="hover:text-accent">
            LinkedIn
          </a>
          <span>{profile.location}</span>
        </div>
      </div>
    </section>
  );
}

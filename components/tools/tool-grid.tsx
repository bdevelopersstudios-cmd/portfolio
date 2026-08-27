"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Stagger, stagStep } from "./ui";
import type { Tool } from "@/lib/tools";

/** Client island: the index page stays a server component around it. */
export function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <Stagger className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <motion.div key={tool.slug} variants={stagStep}>
          <Link
            href={`/tools/${tool.slug}`}
            data-cursor-hover
            className="group flex h-full flex-col rounded-2xl border border-line bg-bg-raised p-6 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_10px_40px_-24px_var(--accent)]"
          >
            <h3 className="font-display text-xl transition-colors group-hover:text-accent">
              {tool.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-dim">{tool.blurb}</p>
            <span className="mt-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
              Open
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </motion.div>
      ))}
    </Stagger>
  );
}

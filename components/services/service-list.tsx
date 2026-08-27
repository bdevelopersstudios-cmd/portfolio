"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { profile } from "@/lib/data";
import { FAQ, PROCESS, SERVICES, formatPrice } from "@/lib/services";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Prefills the subject so an enquiry arrives already labelled. */
function enquiryHref(service?: string) {
  const subject = service ? `${service} — enquiry` : "Project enquiry";
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}`;
}

export function ServiceList() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {SERVICES.map((s, i) => (
        <Reveal key={s.slug} delay={i * 0.06} className={s.featured ? "lg:col-span-2" : ""}>
          <article
            className={`flex h-full flex-col rounded-2xl border p-7 sm:p-9 ${
              s.featured ? "border-accent bg-accent/[0.04]" : "border-line bg-bg-raised"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl sm:text-3xl">{s.name}</h3>
                  {s.featured && (
                    <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-ink">
                      Most asked for
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-xl text-[15px] text-ink-dim">{s.hook}</p>
              </div>

              <div className="shrink-0 text-right">
                <div className="font-display text-3xl leading-none">{formatPrice(s.from)}</div>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  from &middot; {s.timeline}
                </div>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-dim">{s.summary}</p>

            <div className={`mt-6 grid gap-6 ${s.featured ? "sm:grid-cols-2" : ""}`}>
              <ul className="space-y-2.5">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink-dim">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={s.featured ? "" : "mt-2"}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  Best for
                </p>
                <p className="mt-1.5 text-[14px] text-ink-dim">{s.bestFor}</p>

                {s.notIncluded && (
                  <>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      Not included
                    </p>
                    <p className="mt-1.5 text-[14px] text-ink-dim">{s.notIncluded}</p>
                  </>
                )}
              </div>
            </div>

            <a
              href={enquiryHref(s.name)}
              data-cursor-hover
              className={`mt-7 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-opacity hover:opacity-90 ${
                s.featured ? "bg-accent text-accent-ink" : "border border-line text-ink"
              }`}
            >
              Enquire about {s.name}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function ProcessList() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {PROCESS.map((p, i) => (
        <Reveal key={p.n} delay={i * 0.05}>
          <div>
            <span className="font-mono text-[13px] text-accent">{p.n}</span>
            <h3 className="mt-3 font-display text-xl">{p.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{p.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function ServiceFaq() {
  const [open, setOpen] = useState<string | null>(FAQ[0][0]);

  return (
    <div className="mt-8 max-w-3xl">
      {FAQ.map(([q, a]) => {
        const isOpen = open === q;
        return (
          <div key={q} className="border-b border-line-soft">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : q)}
              aria-expanded={isOpen}
              data-cursor-hover
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-lg sm:text-xl">{q}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl text-ink-faint transition-transform"
                style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
              >
                +
              </span>
            </button>
            {isOpen && <p className="pb-5 text-[15px] leading-relaxed text-ink-dim">{a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function ServicesCta() {
  return (
    <Reveal>
      <div className="rounded-2xl border border-line bg-bg-raised p-8 sm:p-12">
        <h2 className="max-w-2xl font-display text-3xl leading-[1.1] sm:text-4xl">
          Not sure which of these you need?
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-ink-dim">
          Describe the problem rather than the solution and I will tell you which
          one fits — or that none of them do, if that is the honest answer.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={enquiryHref()}
            data-cursor-hover
            className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-ink transition-opacity hover:opacity-90"
          >
            Start a conversation
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim transition-colors hover:border-accent hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </Reveal>
  );
}

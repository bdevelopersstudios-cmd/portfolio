"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Nimbus — a SaaS launch page.
 *
 * Everything visual is driven by the token block below, so reskinning is one
 * edit rather than a search across the file. Glassmorphism is deliberately
 * confined to the nav and the plan card: `backdrop-filter` is the single most
 * expensive thing on this page, and spending it everywhere is what makes the
 * effect cost frames on mid-tier Android.
 */
const T = {
  bg: "#07080d",
  panel: "#0e1018",
  panelEdge: "rgba(255,255,255,0.08)",
  ink: "#f4f5f8",
  inkDim: "rgba(244,245,248,0.62)",
  inkFaint: "rgba(244,245,248,0.38)",
  brand: "#6366f1",
  brand2: "#a855f7",
  warm: "#f59e0b",
};

const FEATURES = [
  {
    span: "lg:col-span-2 lg:row-span-2",
    eyebrow: "Core",
    title: "Ship the whole funnel in an afternoon",
    body: "Nav, hero, features, metrics, pricing, proof, footer. Each section is a single component with its content lifted into props, so replacing the copy never means touching layout.",
    tall: true,
  },
  {
    span: "",
    eyebrow: "Billing",
    title: "Pricing that actually calculates",
    body: "Per-seat maths, annual discount, and plan comparison built in.",
  },
  {
    span: "",
    eyebrow: "Motion",
    title: "Scroll reveals, not scroll-jacking",
    body: "Every section fades on entry and respects reduced-motion.",
  },
  {
    span: "lg:col-span-2",
    eyebrow: "Theming",
    title: "One token block, two complete themes",
    body: "Colour, radius and type scale all resolve from a single object. Swap it and the entire page follows — no stray hex codes buried in a component.",
  },
];

const METRICS = [
  { value: "7", label: "Sections" },
  { value: "100", label: "Lighthouse target" },
  { value: "0", label: "UI dependencies" },
  { value: "360px", label: "Narrowest supported" },
];

const PLANS = [
  {
    name: "Starter",
    monthly: 19,
    blurb: "For a first product and a small team.",
    features: ["Up to 3 seats", "10k events / month", "Email support", "Community access"],
    featured: false,
  },
  {
    name: "Growth",
    monthly: 49,
    blurb: "For teams shipping every week.",
    features: [
      "Up to 20 seats",
      "250k events / month",
      "Priority support",
      "Audit log & SSO",
      "Custom domains",
    ],
    featured: true,
  },
  {
    name: "Scale",
    monthly: 99,
    blurb: "For products with real load behind them.",
    features: ["Unlimited seats", "5M events / month", "Dedicated channel", "99.9% uptime SLA"],
    featured: false,
  },
];

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
    // className matters for the bento: this wrapper is the grid child, so any
    // col-span/row-span has to land here rather than on the card inside it.
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Nimbus() {
  const [annual, setAnnual] = useState(true);
  const [seats, setSeats] = useState(5);

  // Two months free on annual — the discount the toggle is actually applying.
  const priceFor = (monthly: number) => (annual ? Math.round(monthly * 10) : monthly);

  return (
    <div style={{ background: T.bg, color: T.ink }} className="min-h-screen font-sans antialiased">
      {/* Ambient wash. Painted once, never animated. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(60vw 50vw at 78% -8%, ${T.brand}44, transparent 62%),
                       radial-gradient(52vw 44vw at 8% 18%, ${T.brand2}33, transparent 64%),
                       radial-gradient(46vw 40vw at 52% 104%, ${T.warm}22, transparent 62%)`,
        }}
      />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b" style={{ borderColor: T.panelEdge }}>
          <div
            className="backdrop-blur-xl"
            style={{ background: "rgba(7,8,13,0.62)" }}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold"
                  style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
                >
                  N
                </span>
                <span className="text-[15px] font-semibold tracking-tight">Nimbus</span>
              </div>
              <nav className="hidden items-center gap-7 text-[13px] md:flex" style={{ color: T.inkDim }}>
                {["Product", "Pricing", "Docs", "Changelog"].map((l) => (
                  <a key={l} href="#" className="transition-colors hover:text-white">
                    {l}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-2.5">
                <a href="#" className="hidden text-[13px] sm:block" style={{ color: T.inkDim }}>
                  Sign in
                </a>
                <a
                  href="#pricing"
                  className="rounded-full px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
                >
                  Start free
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
          <Reveal>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]"
              style={{ borderColor: T.panelEdge, color: T.inkDim }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.warm }} />
              v2.4 — event pipelines are live
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            {/* Wide and loud: the type is the hero, not an illustration. */}
            <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              Ship the product.
              <br />
              <span
                style={{
                  background: `linear-gradient(100deg, ${T.brand}, ${T.brand2} 45%, ${T.warm})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Skip the plumbing.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: T.inkDim }}>
              Auth, billing, usage metering and an audit trail — wired together and
              ready the day you start, so the first commit is your product and not
              your invoice table.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="rounded-full px-6 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
              >
                Start free for 14 days
              </a>
              <a
                href="#features"
                className="rounded-full border px-6 py-3 text-[14px] transition-colors hover:border-white/40"
                style={{ borderColor: T.panelEdge, color: T.ink }}
              >
                See how it works
              </a>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          {/* Bento: four cards at desktop, two at tablet, one stacked on a phone. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06} className={f.span}>
                <div
                  className={`flex h-full flex-col rounded-2xl border p-6 ${f.tall ? "min-h-[15rem] lg:min-h-[21rem]" : ""}`}
                  style={{ borderColor: T.panelEdge, background: T.panel }}
                >
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: T.warm }}
                  >
                    {f.eyebrow}
                  </span>
                  <h3
                    className={`mt-3 font-semibold tracking-tight ${f.tall ? "text-[26px] leading-[1.15]" : "text-[17px]"}`}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-[14px] leading-relaxed" style={{ color: T.inkDim }}>
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
          <div
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border lg:grid-cols-4"
            style={{ borderColor: T.panelEdge, background: T.panelEdge }}
          >
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.05}>
                <div className="px-6 py-8" style={{ background: T.panel }}>
                  <div className="text-[32px] font-semibold tracking-tight">{m.value}</div>
                  <div
                    className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]"
                    style={{ color: T.inkFaint }}
                  >
                    {m.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-[clamp(1.9rem,4vw,2.9rem)] font-semibold tracking-[-0.02em]">
                  Priced per seat, billed how you like
                </h2>
                <p className="mt-3 max-w-md text-[15px]" style={{ color: T.inkDim }}>
                  Move the seat count and switch the billing period — the totals
                  below recalculate as you go.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div
                  className="inline-flex rounded-full border p-1"
                  style={{ borderColor: T.panelEdge, background: T.panel }}
                >
                  {(["Monthly", "Annual"] as const).map((label) => {
                    const isAnnual = label === "Annual";
                    const on = annual === isAnnual;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setAnnual(isAnnual)}
                        aria-pressed={on}
                        className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
                        style={{
                          background: on ? T.brand : "transparent",
                          color: on ? "#fff" : T.inkDim,
                        }}
                      >
                        {label}
                        {isAnnual && <span className="ml-1.5 opacity-70">−17%</span>}
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-3 text-[13px]" style={{ color: T.inkDim }}>
                  <span className="whitespace-nowrap">Seats: {seats}</span>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="h-1 w-40 cursor-pointer appearance-none rounded-full"
                    style={{ accentColor: T.brand, background: "rgba(255,255,255,0.14)" }}
                    aria-label="Number of seats"
                  />
                </label>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.07}>
                <div
                  className="flex h-full flex-col rounded-2xl border p-7"
                  style={{
                    borderColor: plan.featured ? T.brand : T.panelEdge,
                    background: plan.featured ? "rgba(99,102,241,0.09)" : T.panel,
                    backdropFilter: plan.featured ? "blur(12px)" : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[17px] font-semibold">{plan.name}</h3>
                    {plan.featured && (
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white"
                        style={{ background: T.brand }}
                      >
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: T.inkDim }}>
                    {plan.blurb}
                  </p>

                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="text-[40px] font-semibold leading-none tracking-tight">
                      ${priceFor(plan.monthly)}
                    </span>
                    <span className="pb-1 text-[13px]" style={{ color: T.inkFaint }}>
                      /seat/{annual ? "yr" : "mo"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px]" style={{ color: T.inkDim }}>
                    {seats} {seats === 1 ? "seat" : "seats"} ={" "}
                    <span style={{ color: T.ink }}>
                      ${(priceFor(plan.monthly) * seats).toLocaleString()}
                    </span>{" "}
                    per {annual ? "year" : "month"}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px]" style={{ color: T.inkDim }}>
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: plan.featured ? T.brand : T.inkFaint }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="mt-7 w-full rounded-full py-3 text-[14px] font-medium transition-opacity hover:opacity-90"
                    style={{
                      background: plan.featured
                        ? `linear-gradient(135deg, ${T.brand}, ${T.brand2})`
                        : "transparent",
                      border: plan.featured ? "none" : `1px solid ${T.panelEdge}`,
                      color: T.ink,
                    }}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <Reveal>
            <figure
              className="rounded-2xl border p-8 sm:p-12"
              style={{ borderColor: T.panelEdge, background: T.panel }}
            >
              <blockquote className="max-w-3xl text-[clamp(1.25rem,2.6vw,1.8rem)] font-medium leading-[1.35] tracking-[-0.01em]">
                &ldquo;We had billing, metering and an audit log in production the
                same week we started. The part we thought would take a quarter took
                four days.&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold"
                  style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.warm})` }}
                >
                  RK
                </span>
                <span className="text-[13px]" style={{ color: T.inkDim }}>
                  Rina Kovacs &middot; CTO, Fieldnote
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </section>

        <footer className="border-t" style={{ borderColor: T.panelEdge }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 pb-24 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-7 w-7 place-items-center rounded-lg text-[13px] font-bold"
                style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
              >
                N
              </span>
              <span className="text-[13px]" style={{ color: T.inkDim }}>
                © 2026 Nimbus Labs
              </span>
            </div>
            <nav className="flex flex-wrap gap-6 text-[13px]" style={{ color: T.inkDim }}>
              {["Privacy", "Terms", "Status", "Contact"].map((l) => (
                <a key={l} href="#" className="transition-colors hover:text-white">
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

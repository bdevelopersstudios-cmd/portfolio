"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE, Reveal, T } from "./shell";

/* ---------------------------------------------------------------- landing */

const FEATURES = [
  {
    span: "lg:col-span-2 lg:row-span-2",
    eyebrow: "Core",
    title: "Ship the whole funnel in an afternoon",
    body: "Nav, hero, features, metrics, pricing, proof, footer. Each section is a single component with its content lifted into props, so replacing the copy never means touching layout.",
    tall: true,
  },
  { span: "", eyebrow: "Billing", title: "Pricing that actually calculates", body: "Per-seat maths, annual discount, and plan comparison built in." },
  { span: "", eyebrow: "Motion", title: "Scroll reveals, not scroll-jacking", body: "Every section fades on entry and respects reduced-motion." },
  {
    span: "lg:col-span-2",
    eyebrow: "Theming",
    title: "One token block, two complete themes",
    body: "Colour, radius and type scale all resolve from a single object. Swap it and the entire page follows — no stray hex codes buried in a component.",
  },
];

const METRICS = [
  { value: "12", label: "Screens" },
  { value: "100", label: "Lighthouse target" },
  { value: "0", label: "UI dependencies" },
  { value: "360px", label: "Narrowest supported" },
];

export function Landing() {
  return (
    <>
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
            <Link
              href={`${BASE}/pricing`}
              className="rounded-full px-6 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
            >
              Start free for 14 days
            </Link>
            <Link
              href={`${BASE}/product`}
              className="rounded-full border px-6 py-3 text-[14px] transition-colors hover:border-white/40"
              style={{ borderColor: T.panelEdge, color: T.ink }}
            >
              See how it works
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={f.span}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-6 ${f.tall ? "min-h-[15rem] lg:min-h-[21rem]" : ""}`}
                style={{ borderColor: T.panelEdge, background: T.panel }}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: T.warm }}>
                  {f.eyebrow}
                </span>
                <h3 className={`mt-3 font-semibold tracking-tight ${f.tall ? "text-[26px] leading-[1.15]" : "text-[17px]"}`}>
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
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                  {m.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <Reveal>
          <figure className="rounded-2xl border p-8 sm:p-12" style={{ borderColor: T.panelEdge, background: T.panel }}>
            <blockquote className="max-w-3xl text-[clamp(1.25rem,2.6vw,1.8rem)] font-medium leading-[1.35] tracking-[-0.01em]">
              &ldquo;We had billing, metering and an audit log in production the same
              week we started. The part we thought would take a quarter took four
              days.&rdquo;
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
    </>
  );
}

/* ---------------------------------------------------------------- product */

const CAPABILITIES = [
  {
    name: "Authentication",
    body: "Email, magic link and OAuth, with sessions, device management and an audit trail of every sign-in.",
    points: ["Passwordless and password flows", "SSO / SAML on the Scale plan", "Session revocation from the app"],
  },
  {
    name: "Billing",
    body: "Plans, seats, proration and dunning — the parts of Stripe you would otherwise re-implement each time.",
    points: ["Per-seat and usage pricing", "Automatic proration on plan change", "Failed-payment retry ladder"],
  },
  {
    name: "Metering",
    body: "Count anything, enforce it at the boundary, and show customers where they are before they hit the ceiling.",
    points: ["Event ingestion with idempotency", "Hard and soft limits", "Usage surfaced in-product"],
  },
  {
    name: "Audit",
    body: "Every privileged action recorded with actor, target and diff, exportable when a customer asks.",
    points: ["Immutable append-only log", "CSV and JSON export", "Retention configurable per plan"],
  },
];

export function Product() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: T.warm }}>
          Product
        </span>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
          Four systems every subscription product ends up building.
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: T.inkDim }}>
          None of them are your product. All of them take a quarter to get right.
        </p>
      </Reveal>

      <div className="mt-14 space-y-4">
        {CAPABILITIES.map((cap, i) => (
          <Reveal key={cap.name} delay={i * 0.05}>
            <div
              className="grid gap-6 rounded-2xl border p-7 sm:grid-cols-[0.8fr_1.2fr] sm:p-9"
              style={{ borderColor: T.panelEdge, background: T.panel }}
            >
              <div>
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg font-mono text-[13px]"
                  style={{ background: T.panelAlt, color: T.brand }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 text-[22px] font-semibold tracking-tight">{cap.name}</h2>
              </div>
              <div>
                <p className="text-[15px] leading-relaxed" style={{ color: T.inkDim }}>
                  {cap.body}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {cap.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[14px]" style={{ color: T.inkDim }}>
                      <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: T.good }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- pricing */

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
    features: ["Up to 20 seats", "250k events / month", "Priority support", "Audit log & SSO", "Custom domains"],
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

const MATRIX: [string, (string | boolean)[]][] = [
  ["Seats", ["3", "20", "Unlimited"]],
  ["Events / month", ["10k", "250k", "5M"]],
  ["Audit log", [false, true, true]],
  ["SSO / SAML", [false, true, true]],
  ["Custom domains", [false, true, true]],
  ["Uptime SLA", [false, false, true]],
  ["Dedicated support", [false, false, true]],
];

const FAQ = [
  ["Can I change plan mid-cycle?", "Yes. Changes prorate immediately and the difference appears on your next invoice."],
  ["What counts as an event?", "One ingested record. Retries with the same idempotency key are counted once."],
  ["Do you offer annual billing?", "Yes — annual is billed at ten months, so two are effectively free."],
  ["What happens if I exceed my events?", "Soft limits warn in-product. Hard limits reject with a 429 and a documented retry header."],
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [seats, setSeats] = useState(5);
  const [open, setOpen] = useState<string | null>(FAQ[0][0]);
  const priceFor = (monthly: number) => (annual ? Math.round(monthly * 10) : monthly);

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24" id="pricing">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[clamp(1.9rem,4vw,2.9rem)] font-semibold tracking-[-0.02em]">
              Priced per seat, billed how you like
            </h1>
            <p className="mt-3 max-w-md text-[15px]" style={{ color: T.inkDim }}>
              Move the seat count and switch the billing period — the totals below
              recalculate as you go.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="inline-flex rounded-full border p-1" style={{ borderColor: T.panelEdge, background: T.panel }}>
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
                    style={{ background: on ? T.brand : "transparent", color: on ? "#fff" : T.inkDim }}
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
                <span style={{ color: T.ink }}>${(priceFor(plan.monthly) * seats).toLocaleString()}</span> per{" "}
                {annual ? "year" : "month"}
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

              <Link
                href={`${BASE}/login`}
                className="mt-7 w-full rounded-full py-3 text-center text-[14px] font-medium transition-opacity hover:opacity-90"
                style={{
                  background: plan.featured ? `linear-gradient(135deg, ${T.brand}, ${T.brand2})` : "transparent",
                  border: plan.featured ? "none" : `1px solid ${T.panelEdge}`,
                  color: T.ink,
                }}
              >
                Choose {plan.name}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-16 overflow-x-auto rounded-2xl border" style={{ borderColor: T.panelEdge, background: T.panel }}>
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.panelEdge}` }}>
                <th className="px-6 py-4 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: T.inkFaint }}>
                  Compare
                </th>
                {PLANS.map((p) => (
                  <th key={p.name} className="px-6 py-4 text-[13.5px] font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map(([row, cells]) => (
                <tr key={row} style={{ borderBottom: `1px solid ${T.panelEdge}` }}>
                  <td className="px-6 py-3.5 text-[13.5px]" style={{ color: T.inkDim }}>
                    {row}
                  </td>
                  {cells.map((cell, i) => (
                    <td key={i} className="px-6 py-3.5 text-[13.5px]">
                      {typeof cell === "boolean" ? (
                        <span style={{ color: cell ? T.good : T.inkFaint }}>{cell ? "✓" : "—"}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-16 max-w-3xl">
          <h2 className="text-[24px] font-semibold tracking-tight">Questions</h2>
          <div className="mt-6">
            {FAQ.map(([q, a]) => {
              const isOpen = open === q;
              return (
                <div key={q} style={{ borderBottom: `1px solid ${T.panelEdge}` }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : q)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-[16px] font-medium">{q}</span>
                    <span
                      aria-hidden="true"
                      className="text-[18px] transition-transform"
                      style={{ color: T.inkFaint, transform: isOpen ? "rotate(45deg)" : "none" }}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-[14.5px] leading-relaxed" style={{ color: T.inkDim }}>
                      {a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- changelog */

const RELEASES = [
  {
    version: "2.4.0",
    date: "12 August 2026",
    tag: "Feature",
    title: "Event pipelines",
    body: "Route ingested events through transformation steps before they land, with a dry-run mode that shows the diff without writing.",
    items: ["Pipeline builder in the dashboard", "Dry-run against the last 1,000 events", "Per-step failure isolation"],
  },
  {
    version: "2.3.2",
    date: "29 July 2026",
    tag: "Fix",
    title: "Proration rounding",
    body: "Mid-cycle downgrades could round a credit to the wrong cent on plans with odd seat counts. Corrected, and back-credited automatically.",
    items: ["Credits recalculated for 118 affected accounts"],
  },
  {
    version: "2.3.0",
    date: "14 July 2026",
    tag: "Feature",
    title: "SAML for Growth",
    body: "SSO moves down from Scale to Growth, with Okta, Entra and Google Workspace tested end to end.",
    items: ["SCIM provisioning", "Enforced-SSO toggle per domain"],
  },
  {
    version: "2.2.1",
    date: "2 July 2026",
    tag: "Perf",
    title: "Ingestion latency",
    body: "p95 on POST /v1/ingest down from 612ms to 190ms by batching writes behind a queue.",
    items: ["No API change required"],
  },
];

export function Changelog() {
  const tagColor = (t: string) => (t === "Feature" ? T.brand : t === "Fix" ? T.warm : T.good);

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: T.warm }}>
          Changelog
        </span>
        <h1 className="mt-4 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold tracking-[-0.03em]">
          What shipped, and when.
        </h1>
      </Reveal>

      <div className="mt-14">
        {RELEASES.map((r, i) => (
          <Reveal key={r.version} delay={i * 0.05}>
            <article
              className="grid gap-5 py-9 sm:grid-cols-[150px_1fr]"
              style={{ borderTop: `1px solid ${T.panelEdge}` }}
            >
              <div>
                <div className="font-mono text-[13px]">{r.version}</div>
                <div className="mt-1 text-[12.5px]" style={{ color: T.inkFaint }}>
                  {r.date}
                </div>
                <span
                  className="mt-3 inline-block rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                  style={{ background: `${tagColor(r.tag)}22`, color: tagColor(r.tag) }}
                >
                  {r.tag}
                </span>
              </div>
              <div>
                <h2 className="text-[20px] font-semibold tracking-tight">{r.title}</h2>
                <p className="mt-2.5 text-[14.5px] leading-relaxed" style={{ color: T.inkDim }}>
                  {r.body}
                </p>
                <ul className="mt-4 space-y-2">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: T.inkDim }}>
                      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: T.inkFaint }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- docs */

const DOC_SECTIONS = [
  {
    id: "install",
    title: "Installation",
    body: "Add the SDK and set one environment variable. Nothing else is required to send your first event.",
    code: `npm i @nimbus/sdk

# .env.local
NIMBUS_KEY=sk_live_...`,
  },
  {
    id: "ingest",
    title: "Sending events",
    body: "Every event needs a name and an actor. An idempotency key is optional but recommended for anything retried.",
    code: `import { nimbus } from "@nimbus/sdk";

await nimbus.track({
  name: "project.created",
  actor: user.id,
  idempotencyKey: req.headers["x-request-id"],
  properties: { plan: "growth", seats: 20 },
});`,
  },
  {
    id: "limits",
    title: "Enforcing limits",
    body: "Ask before you act. The check is a single round trip and is cached for the request's lifetime.",
    code: `const { allowed, remaining } = await nimbus.check({
  account: org.id,
  meter: "events",
});

if (!allowed) return res.status(429).json({ remaining });`,
  },
  {
    id: "webhooks",
    title: "Webhooks",
    body: "Verify the signature before trusting the body. The helper does a constant-time compare.",
    code: `const event = nimbus.webhooks.verify(
  rawBody,
  req.headers["nimbus-signature"],
  process.env.NIMBUS_WEBHOOK_SECRET,
);`,
  },
];

export function Docs() {
  const [active, setActive] = useState(DOC_SECTIONS[0].id);
  const section = DOC_SECTIONS.find((s) => s.id === active) ?? DOC_SECTIONS[0];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Getting started
          </span>
          <nav className="mt-4 space-y-1">
            {DOC_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={active === s.id ? "true" : undefined}
                className="block w-full rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors"
                style={{
                  background: active === s.id ? T.panelAlt : "transparent",
                  color: active === s.id ? T.ink : T.inkDim,
                }}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{section.title}</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
            {section.body}
          </p>

          <div
            className="mt-7 overflow-x-auto rounded-2xl border"
            style={{ borderColor: T.panelEdge, background: T.panel }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{ borderBottom: `1px solid ${T.panelEdge}` }}
            >
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((dot) => (
                <span key={dot} className="h-2.5 w-2.5 rounded-full opacity-60" style={{ background: dot }} />
              ))}
              <span className="ml-2 font-mono text-[11.5px]" style={{ color: T.inkFaint }}>
                {section.id}.ts
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-relaxed" style={{ color: T.inkDim }}>
              {section.code}
            </pre>
          </div>

          <div
            className="mt-6 rounded-2xl border p-5"
            style={{ borderColor: T.panelEdge, background: "rgba(99,102,241,0.07)" }}
          >
            <p className="text-[13.5px]" style={{ color: T.inkDim }}>
              <strong style={{ color: T.ink }}>Note</strong> — every snippet here is
              illustrative. Swap the SDK calls for your own client and the page
              structure still holds.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

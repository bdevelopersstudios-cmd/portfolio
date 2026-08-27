"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BASE, T } from "./shell";
import { PROJECTS, type Project } from "./projects";

const HEADLINE = ["Design", "that", "earns", "its", "keep."];
const MARQUEE = ["Brand systems", "Editorial design", "Product UI", "Art direction", "Motion", "Packaging"];

/* ------------------------------------------------------------------- home */

export function Home() {
  const reduced = useReducedMotion();

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <h1 className="text-[clamp(3rem,11vw,9rem)] font-semibold leading-[0.86] tracking-[-0.04em]">
          {HEADLINE.map((word, i) => (
            // pb is load-bearing: the mask is overflow-hidden and at this
            // line-height the descenders of `g` and `p` fall outside it.
            <span key={word} className="inline-block overflow-hidden pb-[0.14em] pr-[0.22em] align-bottom">
              <motion.span
                className="inline-block"
                initial={reduced ? false : { y: "110%" }}
                animate={reduced ? undefined : { y: "0%" }}
                transition={{ duration: 0.75, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                style={i === 3 ? { color: T.rust, fontStyle: "italic" } : undefined}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-lg text-[17px] leading-relaxed" style={{ color: T.inkDim }}>
            An independent studio in Rotterdam working on identity, editorial and
            product. We take a small number of projects a year and stay on them
            until they are actually finished.
          </p>
          <dl className="flex gap-10">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                Since
              </dt>
              <dd className="mt-1 text-[24px] font-semibold tracking-tight">2014</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                Projects
              </dt>
              <dd className="mt-1 text-[24px] font-semibold tracking-tight">140+</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="group overflow-hidden border-y py-4" style={{ borderColor: T.line, background: T.sand }}>
        <div
          className="flex w-max gap-10 whitespace-nowrap"
          style={{ animation: reduced ? undefined : "atelier-marquee 34s linear infinite" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-10" aria-hidden={dup === 1}>
              {MARQUEE.map((m) => (
                <span key={m} className="flex items-center gap-10 text-[22px] tracking-tight sm:text-[30px]">
                  {m}
                  {/* A drawn dot, not a glyph: ✳ resolves to a colour emoji on
                      most platforms and breaks the palette. */}
                  <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: T.rust }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]">Selected work</h2>
          <Link href={`${BASE}/work`} className="border-b pb-1 text-[14px]" style={{ borderColor: T.rust, color: T.rust }}>
            See everything →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PROJECTS.slice(0, 4).map((p, i) => (
            <ProjectTile key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>

      <section className="border-y" style={{ borderColor: T.line, background: T.sand }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-[0.9fr_1.1fr] sm:px-8 sm:py-24">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.06] tracking-[-0.02em]">
            We work in the open, and we finish what we start.
          </h2>
          <div className="space-y-5 text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
            <p>
              Every project runs from a shared board you can see at any hour. No
              status meetings to find out where things are, and no reveal at the
              end that turns out to be the first honest conversation.
            </p>
            <p>
              We price in phases, and each phase ends with something you own
              outright — files, fonts, source, rights. If we stop after phase one,
              you still have phase one.
            </p>
            <Link
              href={`${BASE}/studio`}
              className="inline-block border-b pb-1 text-[15px] font-medium"
              style={{ borderColor: T.rust, color: T.rust }}
            >
              Read how we work →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes atelier-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .group:hover [style*="atelier-marquee"] { animation-play-state: paused; }
      `}</style>
    </>
  );
}

function ProjectTile({ project, index }: { project: Project; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`${BASE}/work/${project.slug}`} className="group block">
        <div
          className="flex h-56 items-end rounded-lg p-6 transition-transform duration-500 group-hover:scale-[1.015]"
          style={{
            background: `linear-gradient(135deg, ${T.sand}, ${index % 2 ? T.teal : T.rust}26)`,
          }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkDim }}>
            {project.discipline} · {project.year}
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-[20px] font-medium tracking-tight">{project.title}</h3>
          <span className="text-[13px]" style={{ color: T.inkFaint }}>
            {project.client}
          </span>
        </div>
        <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: T.inkDim }}>
          {project.note}
        </p>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------- work */

const FILTERS = ["All", "Brand", "Digital", "Print"] as const;

export function Work() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.discipline === filter)),
    [filter]
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-semibold tracking-[-0.03em]">Work</h1>
      <p className="mt-4 max-w-lg text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
        Six projects from the last three years. Each one has a written account of
        what the problem actually was.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={on}
              className="rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors"
              style={{
                borderColor: on ? T.ink : T.line,
                background: on ? T.ink : "transparent",
                color: on ? T.bg : T.inkDim,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <ProjectTile key={p.slug} project={p} index={i} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-16 text-center text-[15px]" style={{ color: T.inkFaint }}>
          Nothing in that discipline yet.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- case study */

export function CaseStudy({ project }: { project: Project }) {
  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <article>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <Link href={`${BASE}/work`} className="text-[13.5px]" style={{ color: T.inkDim }}>
          ← All work
        </Link>
        <h1 className="mt-6 text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
          {project.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[18px] leading-relaxed" style={{ color: T.inkDim }}>
          {project.note}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4" style={{ borderTop: `1px solid ${T.line}`, paddingTop: 24 }}>
          {[
            ["Client", project.client],
            ["Year", project.year],
            ["Discipline", project.discipline],
            ["Scope", `${project.scope.length} workstreams`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                {k}
              </dt>
              <dd className="mt-1.5 text-[15px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        className="h-[38vh] min-h-[240px] w-full sm:h-[52vh]"
        style={{ background: `linear-gradient(135deg, ${T.sand}, ${idx % 2 ? T.teal : T.rust}33)` }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-[1fr_2fr]">
          <h2 className="text-[13px] font-mono uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            The problem
          </h2>
          <p className="text-[17px] leading-relaxed">{project.summary}</p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-[1fr_2fr]" style={{ borderTop: `1px solid ${T.line}`, paddingTop: 40 }}>
          <h2 className="text-[13px] font-mono uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Scope
          </h2>
          <ul className="space-y-3">
            {project.scope.map((s) => (
              <li key={s} className="flex items-start gap-3 text-[16px]" style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
                <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: T.rust }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.line}`, background: T.sand }}>
        <Link href={`${BASE}/work/${next.slug}`} className="group block">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-12 sm:px-8 sm:py-16">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
                Next project
              </span>
              <h2 className="mt-2 text-[clamp(1.6rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
                {next.title}
              </h2>
            </div>
            <span aria-hidden="true" className="text-[28px] transition-transform group-hover:translate-x-1" style={{ color: T.rust }}>
              →
            </span>
          </div>
        </Link>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------- studio */

const TEAM = [
  { name: "Joost Meijer", role: "Founder, design director", since: "2014" },
  { name: "Amara Diallo", role: "Design lead, editorial", since: "2018" },
  { name: "Bram de Wit", role: "Design lead, digital", since: "2020" },
  { name: "Sofia Ricci", role: "Producer", since: "2022" },
];

const PHASES = [
  ["01", "Read", "A week of reading everything you already have — decks, complaints, analytics, the internal wiki nobody maintains."],
  ["02", "Frame", "We write down what the problem actually is. If we disagree with your brief, this is where you find out."],
  ["03", "Make", "Two directions, taken far enough to judge. Not six thumbnails."],
  ["04", "Land", "Files, fonts, source, rights, and a written standard so it survives us leaving."],
];

export function Studio() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
          Eleven people, one room, no account managers.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed" style={{ color: T.inkDim }}>
          The people who pitch the work are the people who do the work. That is
          the whole operating principle and it is the reason we stay small.
        </p>
      </section>

      <section className="border-y" style={{ borderColor: T.line, background: T.sand }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            How a project runs
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map(([n, title, body]) => (
              <div key={n}>
                <span className="font-mono text-[13px]" style={{ color: T.rust }}>
                  {n}
                </span>
                <h3 className="mt-3 text-[19px] font-medium tracking-tight">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: T.inkDim }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
          The room
        </h2>
        <ul className="mt-8" style={{ borderTop: `1px solid ${T.line}` }}>
          {TEAM.map((m) => (
            <li
              key={m.name}
              className="flex flex-wrap items-baseline justify-between gap-3 py-5"
              style={{ borderBottom: `1px solid ${T.line}` }}
            >
              <span className="text-[clamp(1.2rem,2.6vw,1.7rem)] font-medium tracking-[-0.01em]">{m.name}</span>
              <span className="text-[14px]" style={{ color: T.inkDim }}>
                {m.role}
              </span>
              <span className="font-mono text-[12px]" style={{ color: T.inkFaint }}>
                since {m.since}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- journal */

const POSTS = [
  { title: "The brief is never the problem", date: "4 August 2026", read: "6 min", cat: "Practice" },
  { title: "Designing for the die-stamp first", date: "19 July 2026", read: "9 min", cat: "Craft" },
  { title: "What we stopped charging for", date: "28 June 2026", read: "4 min", cat: "Studio" },
  { title: "Two directions, not six thumbnails", date: "11 June 2026", read: "7 min", cat: "Practice" },
  { title: "A grid that survives a poem and an essay", date: "23 May 2026", read: "11 min", cat: "Craft" },
];

export function Journal() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-semibold tracking-[-0.03em]">Journal</h1>
      <p className="mt-4 max-w-lg text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
        Notes on practice, mostly written after something went wrong.
      </p>

      <ul className="mt-12" style={{ borderTop: `1px solid ${T.line}` }}>
        {POSTS.map((p) => (
          <li key={p.title} style={{ borderBottom: `1px solid ${T.line}` }}>
            <a href="#" className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: T.rust }}>
                {p.cat}
              </span>
              <span className="flex-1 text-[clamp(1.2rem,3vw,1.9rem)] font-medium tracking-[-0.02em]">
                {p.title}
              </span>
              <span className="font-mono text-[12px]" style={{ color: T.inkFaint }}>
                {p.date} · {p.read}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- contact */

const BUDGETS = ["Under €10k", "€10–25k", "€25–60k", "€60k+"];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", budget: "", brief: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "We need something to call you.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.budget) next.budget = "Pick a range — it saves us both a call.";
    if (form.brief.trim().length < 20) next.brief = "A sentence or two more, please.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  const inputStyle = (k: string) => ({
    borderColor: errors[k] ? T.rust : T.line,
    background: "#fff",
    color: T.ink,
  });

  if (sent) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em]">Thank you.</h1>
        <p className="mt-4 text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
          We read everything ourselves and reply within two working days. This is
          a template, so nothing was actually sent.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", budget: "", brief: "" });
          }}
          className="mt-8 rounded-full px-5 py-2.5 text-[14px] font-medium text-white"
          style={{ background: T.ink }}
        >
          Send another
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-semibold tracking-[-0.03em]">Start a project</h1>
      <p className="mt-4 max-w-lg text-[16px] leading-relaxed" style={{ color: T.inkDim }}>
        We take roughly eight projects a year. Tell us what the problem is rather
        than what you want made, and we will tell you honestly whether we are the
        right studio for it.
      </p>

      <form onSubmit={submit} noValidate className="mt-12 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Name
          </span>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-2 w-full rounded-lg border px-4 py-3 text-[15px] outline-none"
            style={inputStyle("name")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <span role="alert" className="mt-1.5 block text-[12.5px]" style={{ color: T.rust }}>
              {errors.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="mt-2 w-full rounded-lg border px-4 py-3 text-[15px] outline-none"
            style={inputStyle("email")}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <span role="alert" className="mt-1.5 block text-[12.5px]" style={{ color: T.rust }}>
              {errors.email}
            </span>
          )}
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Budget
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {BUDGETS.map((b) => {
              const on = form.budget === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => set("budget", b)}
                  aria-pressed={on}
                  className="rounded-full border px-4 py-2 text-[13.5px] transition-colors"
                  style={{
                    borderColor: on ? T.ink : errors.budget ? T.rust : T.line,
                    background: on ? T.ink : "transparent",
                    color: on ? T.bg : T.inkDim,
                  }}
                >
                  {b}
                </button>
              );
            })}
          </div>
          {errors.budget && (
            <span role="alert" className="mt-2 block text-[12.5px]" style={{ color: T.rust }}>
              {errors.budget}
            </span>
          )}
        </fieldset>

        <label className="block sm:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            What is the problem?
          </span>
          <textarea
            rows={6}
            value={form.brief}
            onChange={(e) => set("brief", e.target.value)}
            className="mt-2 w-full resize-y rounded-lg border px-4 py-3 text-[15px] leading-relaxed outline-none"
            style={inputStyle("brief")}
            aria-invalid={Boolean(errors.brief)}
          />
          {errors.brief && (
            <span role="alert" className="mt-1.5 block text-[12.5px]" style={{ color: T.rust }}>
              {errors.brief}
            </span>
          )}
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-full px-7 py-3.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: T.ink }}
          >
            Send it over
          </button>
        </div>
      </form>
    </section>
  );
}

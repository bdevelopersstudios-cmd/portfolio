"use client";

import { useState } from "react";
import Link from "next/link";
import { BASE, Logo, T } from "./shell";

/* ------------------------------------------------------------------ login */

/**
 * Auth screen with sign-in and sign-up on one route. Validation is real
 * enough to demonstrate every state — empty, invalid, mismatched, submitting,
 * done — without pretending a regex is genuine address verification.
 */
export function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "At least 8 characters.";
    if (mode === "up" && confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setState("sending");
    window.setTimeout(() => setState("done"), 900);
  };

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    type = "text",
    autoComplete?: string
  ) => (
    <label className="block">
      <span className="text-[13px]" style={{ color: T.inkDim }}>
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => {
          onChange(e.target.value);
          setErrors((p) => ({ ...p, [id]: "" }));
        }}
        className="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-[14px] outline-none transition-colors"
        style={{
          borderColor: errors[id] ? "#f43f5e" : T.panelEdge,
          background: T.panelAlt,
          color: T.ink,
        }}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      />
      {errors[id] && (
        <span id={`${id}-error`} role="alert" className="mt-1.5 block text-[12.5px]" style={{ color: "#f43f5e" }}>
          {errors[id]}
        </span>
      )}
    </label>
  );

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20 sm:py-28">
      <div className="rounded-2xl border p-8" style={{ borderColor: T.panelEdge, background: T.panel }}>
        <div className="flex items-center gap-2.5">
          <Logo size={8} />
          <span className="text-[16px] font-semibold tracking-tight">Nimbus</span>
        </div>

        <h1 className="mt-6 text-[24px] font-semibold tracking-tight">
          {mode === "in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1.5 text-[13.5px]" style={{ color: T.inkDim }}>
          {mode === "in" ? "Welcome back." : "14 days free, no card required."}
        </p>

        {state === "done" ? (
          <div
            role="status"
            className="mt-7 rounded-xl border p-5 text-center"
            style={{ borderColor: T.panelEdge, background: T.panelAlt }}
          >
            <p className="text-[14.5px]">
              {mode === "in" ? "Signed in." : "Account created."}
            </p>
            <p className="mt-1.5 text-[13px]" style={{ color: T.inkDim }}>
              This is a template — nothing was sent anywhere.
            </p>
            <Link
              href={`${BASE}/app`}
              className="mt-5 inline-block w-full rounded-full py-2.5 text-[14px] font-medium text-white"
              style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
            >
              Continue to the app
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-2.5">
              {["Google", "GitHub"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded-lg border py-2.5 text-[13.5px] transition-colors hover:border-white/30"
                  style={{ borderColor: T.panelEdge, color: T.ink }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: T.panelEdge }} />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: T.inkFaint }}>
                or
              </span>
              <span className="h-px flex-1" style={{ background: T.panelEdge }} />
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {field("email", "Email", email, setEmail, "email", "email")}
              {field(
                "password",
                "Password",
                password,
                setPassword,
                "password",
                mode === "in" ? "current-password" : "new-password"
              )}
              {mode === "up" && field("confirm", "Confirm password", confirm, setConfirm, "password", "new-password")}

              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-full py-3 text-[14px] font-medium text-white transition-opacity disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
              >
                {state === "sending" ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px]" style={{ color: T.inkDim }}>
              {mode === "in" ? "No account yet?" : "Already have one?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setErrors({});
                }}
                className="underline"
                style={{ color: T.ink }}
              >
                {mode === "in" ? "Create one" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- app */

const PROJECTS = [
  { name: "fieldnote-web", events: "184k", plan: "Growth", status: "Healthy", updated: "2 min ago" },
  { name: "fieldnote-api", events: "92k", plan: "Growth", status: "Healthy", updated: "8 min ago" },
  { name: "internal-tools", events: "12k", plan: "Starter", status: "Degraded", updated: "1 hr ago" },
];

const ACTIVITY = [
  { who: "Dan Okafor", what: "upgraded the plan to Growth", when: "12 minutes ago" },
  { who: "Priya Raman", what: "rotated the production API key", when: "1 hour ago" },
  { who: "System", what: "retried 3 failed webhook deliveries", when: "2 hours ago" },
  { who: "Mara Silva", what: "invited lena@fieldnote.io as Viewer", when: "Yesterday" },
];

/** The in-product surface a buyer lands on after auth. */
export function AppHome() {
  const [tab, setTab] = useState<"Projects" | "Activity">("Projects");

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: T.inkFaint }}>
            Fieldnote
          </span>
          <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            Good afternoon, Mara
          </h1>
        </div>
        <button
          type="button"
          className="rounded-full px-5 py-2.5 text-[13.5px] font-medium text-white"
          style={{ background: `linear-gradient(135deg, ${T.brand}, ${T.brand2})` }}
        >
          New project
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Events today", v: "184,230", d: "+8.1%" },
          { l: "Seats used", v: "20 / 20", d: "at limit" },
          { l: "Error rate", v: "0.42%", d: "−0.18%" },
          { l: "Next invoice", v: "$980", d: "1 Sep" },
        ].map((m) => (
          <div key={m.l} className="rounded-2xl border p-5" style={{ borderColor: T.panelEdge, background: T.panel }}>
            <div className="text-[12px]" style={{ color: T.inkFaint }}>
              {m.l}
            </div>
            <div className="mt-2 text-[24px] font-semibold tracking-tight">{m.v}</div>
            <div className="mt-1 text-[12px]" style={{ color: T.good }}>
              {m.d}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2" role="tablist">
        {(["Projects", "Activity"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="rounded-lg border px-4 py-2 text-[13px] transition-colors"
            style={{
              borderColor: tab === t ? "transparent" : T.panelEdge,
              background: tab === t ? T.panelAlt : "transparent",
              color: tab === t ? T.ink : T.inkDim,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border" style={{ borderColor: T.panelEdge, background: T.panel }}>
        {tab === "Projects" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.panelEdge}` }}>
                  {["Project", "Events", "Plan", "Status", "Updated"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em]"
                      style={{ color: T.inkFaint }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${T.panelEdge}` }}>
                    <td className="px-5 py-4 font-mono text-[13px]">{p.name}</td>
                    <td className="px-5 py-4 text-[13.5px]" style={{ color: T.inkDim }}>
                      {p.events}
                    </td>
                    <td className="px-5 py-4 text-[13.5px]" style={{ color: T.inkDim }}>
                      {p.plan}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                        style={{
                          background: p.status === "Healthy" ? `${T.good}22` : `${T.warm}22`,
                          color: p.status === "Healthy" ? T.good : T.warm,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px]" style={{ color: T.inkFaint }}>
                      {p.updated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul>
            {ACTIVITY.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-3 px-5 py-4"
                style={{ borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${T.panelEdge}` : undefined }}
              >
                <span
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                  style={{ background: T.panelAlt, color: T.inkDim }}
                >
                  {a.who.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <span className="text-[13.5px]" style={{ color: T.inkDim }}>
                  <strong style={{ color: T.ink }}>{a.who}</strong> {a.what}
                  <span className="ml-2 text-[12px]" style={{ color: T.inkFaint }}>
                    {a.when}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

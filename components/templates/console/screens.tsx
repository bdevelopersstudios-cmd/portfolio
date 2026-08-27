"use client";

import { useMemo, useState } from "react";
import { AreaChart, BarChart } from "./chart";
import { Card, PageHead, useConsole } from "./shell";
import { INVOICES, LATENCY, MEMBERS, ROWS, SERIES, type Member, type Row } from "./data";

/* ------------------------------------------------------------------ shared */

function Metric({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  const { c } = useConsole();
  return (
    <Card className="p-4">
      <div className="text-[12px]" style={{ color: c.inkFaint }}>
        {label}
      </div>
      <div className="mt-2 text-[26px] font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-[12px] font-medium" style={{ color: positive ? c.accent : c.danger }}>
        {delta}
      </div>
    </Card>
  );
}

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize"
      style={{ background: `${tone}22`, color: tone }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {children}
    </span>
  );
}

function RangeTabs() {
  const { c } = useConsole();
  const [range, setRange] = useState("24h");
  return (
    <div className="flex gap-2">
      {["24h", "7d", "30d"].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          aria-pressed={range === r}
          className="rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors"
          style={{
            borderColor: range === r ? "transparent" : c.edge,
            background: range === r ? c.accent : "transparent",
            color: range === r ? "#fff" : c.inkDim,
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- overview */

export function Overview() {
  const { c, query } = useConsole();
  const [sort, setSort] = useState<{ key: keyof Row; dir: 1 | -1 }>({ key: "calls", dir: -1 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? ROWS.filter((r) => r.endpoint.toLowerCase().includes(q)) : ROWS;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sort.dir;
      return ((av as number) - (bv as number)) * sort.dir;
    });
  }, [query, sort]);

  const toggle = (key: keyof Row) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: -1 }));

  const tone = (s: Row["status"]) =>
    s === "healthy" ? c.accent : s === "degraded" ? c.warn : c.danger;

  return (
    <>
      <PageHead title="Overview" sub="Last 24 hours · updated 2 minutes ago" actions={<RangeTabs />} />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Active users" value="6,620" delta="+12.4%" positive />
        <Metric label="Events / day" value="184k" delta="+8.1%" positive />
        <Metric label="Error rate" value="0.42%" delta="−0.18%" positive />
        <Metric label="p95 latency" value="218ms" delta="+14ms" positive={false} />
      </div>

      <div className="mt-3">
        <Card>
          <AreaChart values={SERIES} label="Active users" />
        </Card>
      </div>

      <div className="mt-3">
        <Card pad={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[15px] font-semibold">Endpoints</h2>
            <span className="text-[12px]" style={{ color: c.inkFaint }}>
              {rows.length} of {ROWS.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr style={{ borderTop: `1px solid ${c.edge}`, borderBottom: `1px solid ${c.edge}` }}>
                  {([
                    ["endpoint", "Endpoint"],
                    ["calls", "Calls"],
                    ["p95", "p95"],
                    ["errors", "Errors"],
                    ["region", "Region"],
                  ] as [keyof Row, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      className="px-5 py-3"
                      aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
                        style={{ color: sort.key === key ? c.ink : c.inkFaint }}
                      >
                        {label}
                        <span aria-hidden="true" className="text-[9px]">
                          {sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : "▁"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: c.inkFaint }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${c.edge}` }}>
                    <td className="px-5 py-3.5 font-mono text-[13px]">{r.endpoint}</td>
                    <td className="px-5 py-3.5 text-[13.5px]" style={{ color: c.inkDim }}>
                      {r.calls.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px]" style={{ color: c.inkDim }}>
                      {r.p95}ms
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px]" style={{ color: r.errors > 1 ? c.danger : c.inkDim }}>
                      {r.errors}%
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[12.5px]" style={{ color: c.inkDim }}>
                      {r.region}
                    </td>
                    <td className="px-5 py-3.5">
                      <Pill tone={tone(r.status)}>{r.status}</Pill>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13.5px]" style={{ color: c.inkFaint }}>
                      Nothing matches “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- traffic */

export function Traffic() {
  const { c } = useConsole();
  const [region, setRegion] = useState("all");
  const regions = ["all", ...Array.from(new Set(ROWS.map((r) => r.region)))];
  const shown = region === "all" ? ROWS : ROWS.filter((r) => r.region === region);
  const totalCalls = shown.reduce((n, r) => n + r.calls, 0);

  return (
    <>
      <PageHead title="Traffic" sub="Request volume and latency by endpoint" actions={<RangeTabs />} />

      <div className="mt-6 flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
            className="rounded-lg border px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors"
            style={{
              borderColor: region === r ? "transparent" : c.edge,
              background: region === r ? c.accent2 : "transparent",
              color: region === r ? "#fff" : c.inkDim,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card>
          <AreaChart values={SERIES} label="Requests" height={200} />
        </Card>
        <Card>
          <AreaChart
            values={LATENCY}
            label="p95 latency"
            color={c.warn}
            format={(v) => `${v}ms`}
            height={200}
          />
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total calls" value={totalCalls.toLocaleString()} delta="+9.2%" positive />
        <Metric label="Endpoints" value={String(shown.length)} delta={region === "all" ? "all regions" : region} positive />
        <Metric label="Slowest" value={`${Math.max(...shown.map((r) => r.p95))}ms`} delta="p95" positive={false} />
        <Metric
          label="Worst error rate"
          value={`${Math.max(...shown.map((r) => r.errors))}%`}
          delta="last 24h"
          positive={false}
        />
      </div>

      <div className="mt-3">
        <Card pad={false} className="overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="text-[15px] font-semibold">Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <tbody>
                {shown.map((r) => {
                  const share = (r.calls / totalCalls) * 100;
                  return (
                    <tr key={r.id} style={{ borderTop: `1px solid ${c.edge}` }}>
                      <td className="px-5 py-4 font-mono text-[13px]">{r.endpoint}</td>
                      <td className="w-1/2 px-5 py-4">
                        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: c.panelAlt }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, background: c.accent }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-[13px]" style={{ color: c.inkDim }}>
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- billing */

export function Billing() {
  const { c } = useConsole();
  const [seats, setSeats] = useState(20);
  const [annual, setAnnual] = useState(false);
  const perSeat = annual ? 490 : 49;
  const total = seats * perSeat;

  const tone = (s: string) => (s === "paid" ? c.accent : s === "open" ? c.warn : c.danger);

  return (
    <>
      <PageHead title="Billing" sub="Plan, usage and invoices" />

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: c.inkFaint }}>
                Current plan
              </span>
              <h2 className="mt-2 text-[22px] font-semibold tracking-tight">Growth</h2>
            </div>
            <div
              className="inline-flex rounded-full border p-1"
              style={{ borderColor: c.edge, background: c.panelAlt }}
            >
              {(["Monthly", "Annual"] as const).map((l) => {
                const isAnnual = l === "Annual";
                const on = annual === isAnnual;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setAnnual(isAnnual)}
                    aria-pressed={on}
                    className="rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
                    style={{ background: on ? c.accent : "transparent", color: on ? "#fff" : c.inkDim }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-6 block">
            <span className="text-[13px]" style={{ color: c.inkDim }}>
              Seats: {seats}
            </span>
            <input
              type="range"
              min={1}
              max={60}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full"
              style={{ accentColor: c.accent, background: c.panelAlt }}
              aria-label="Number of seats"
            />
          </label>

          <div className="mt-6 flex items-end gap-2" style={{ borderTop: `1px solid ${c.edge}`, paddingTop: 20 }}>
            <span className="text-[38px] font-semibold leading-none tracking-tight">
              ${total.toLocaleString()}
            </span>
            <span className="pb-1 text-[13px]" style={{ color: c.inkFaint }}>
              per {annual ? "year" : "month"} · ${perSeat}/seat
            </span>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-lg py-2.5 text-[13.5px] font-medium text-white"
            style={{ background: c.accent }}
          >
            Update subscription
          </button>
        </Card>

        <Card>
          <h2 className="text-[15px] font-semibold">Usage this cycle</h2>
          <div className="mt-5">
            <BarChart
              values={[142, 168, 155, 181, 174, 198, 184]}
              labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            />
          </div>
          <p className="mt-4 text-[13px]" style={{ color: c.inkDim }}>
            1.20M of 5M events used —{" "}
            <span style={{ color: c.ink }}>24%</span> of your monthly allowance.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: c.panelAlt }}>
            <div className="h-full rounded-full" style={{ width: "24%", background: c.accent2 }} />
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card pad={false} className="overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="text-[15px] font-semibold">Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr style={{ borderTop: `1px solid ${c.edge}`, borderBottom: `1px solid ${c.edge}` }}>
                  {["Invoice", "Date", "Seats", "Amount", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em]"
                      style={{ color: c.inkFaint }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${c.edge}` }}>
                    <td className="px-5 py-3.5 font-mono text-[13px]">{inv.id}</td>
                    <td className="px-5 py-3.5 text-[13.5px]" style={{ color: c.inkDim }}>
                      {inv.date}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px]" style={{ color: c.inkDim }}>
                      {inv.seats}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px]">${inv.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={tone(inv.status)}>{inv.status}</Pill>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" className="text-[13px] underline" style={{ color: c.inkDim }}>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------- team */

export function Team() {
  const { c, query } = useConsole();
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [invite, setInvite] = useState("");
  const [role, setRole] = useState<Member["role"]>("Developer");
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = invite.trim();
    // Deliberately shallow: enough to demonstrate the error state without
    // pretending a regex is real address validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That does not look like an email address.");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      setError("That person is already on the team.");
      return;
    }
    setMembers((prev) => [
      {
        id: `m${Date.now()}`,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()),
        email,
        role,
        status: "invited",
        seen: "—",
      },
      ...prev,
    ]);
    setInvite("");
    setError(null);
  };

  return (
    <>
      <PageHead title="Team" sub={`${members.length} people · ${members.filter((m) => m.status === "invited").length} pending`} />

      <div className="mt-6">
        <Card>
          <h2 className="text-[15px] font-semibold">Invite someone</h2>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                value={invite}
                onChange={(e) => {
                  setInvite(e.target.value);
                  setError(null);
                }}
                placeholder="name@company.com"
                className="w-full rounded-lg border px-3.5 py-2.5 text-[13.5px] outline-none placeholder:opacity-50"
                style={{
                  borderColor: error ? c.danger : c.edge,
                  background: c.panelAlt,
                  color: c.ink,
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "invite-error" : undefined}
              />
            </label>
            <label>
              <span className="sr-only">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Member["role"])}
                className="w-full rounded-lg border px-3.5 py-2.5 text-[13.5px] outline-none sm:w-auto"
                style={{ borderColor: c.edge, background: c.panelAlt, color: c.ink }}
              >
                {["Admin", "Developer", "Viewer"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-lg px-5 py-2.5 text-[13.5px] font-medium text-white"
              style={{ background: c.accent }}
            >
              Send invite
            </button>
          </form>
          {error && (
            <p id="invite-error" role="alert" className="mt-2.5 text-[12.5px]" style={{ color: c.danger }}>
              {error}
            </p>
          )}
        </Card>
      </div>

      <div className="mt-3">
        <Card pad={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.edge}` }}>
                  {["Member", "Role", "Last seen", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em]"
                      style={{ color: c.inkFaint }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${c.edge}` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${c.accent2}, ${c.accent})` }}
                        >
                          {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                        <span>
                          <span className="block text-[13.5px]">{m.name}</span>
                          <span className="block text-[12px]" style={{ color: c.inkFaint }}>
                            {m.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          setMembers((prev) =>
                            prev.map((p) =>
                              p.id === m.id ? { ...p, role: e.target.value as Member["role"] } : p
                            )
                          )
                        }
                        disabled={m.role === "Owner"}
                        className="rounded-lg border px-2.5 py-1.5 text-[12.5px] outline-none disabled:opacity-50"
                        style={{ borderColor: c.edge, background: c.panelAlt, color: c.ink }}
                        aria-label={`Role for ${m.name}`}
                      >
                        {["Owner", "Admin", "Developer", "Viewer"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-[13px]" style={{ color: c.inkDim }}>
                      {m.seen}
                    </td>
                    <td className="px-5 py-3.5">
                      <Pill tone={m.status === "active" ? c.accent : c.warn}>{m.status}</Pill>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {m.role !== "Owner" && (
                        <button
                          type="button"
                          onClick={() => setMembers((prev) => prev.filter((p) => p.id !== m.id))}
                          className="text-[13px] underline"
                          style={{ color: c.danger }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[13.5px]" style={{ color: c.inkFaint }}>
                      Nobody matches “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- settings */

const TABS = ["Project", "Notifications", "API keys"] as const;

export function Settings() {
  const { c } = useConsole();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Project");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Fieldnote");
  const [slug, setSlug] = useState("fieldnote");
  const [alerts, setAlerts] = useState({ errors: true, latency: true, weekly: false, billing: true });
  const [revealed, setRevealed] = useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const KEYS = [
    { id: "k1", label: "Production", value: "sk_live_9f2b7c41ae08d3", created: "Mar 2026" },
    { id: "k2", label: "Staging", value: "sk_test_4c81ba90ef27d5", created: "Jun 2026" },
  ];

  return (
    <>
      <PageHead title="Settings" sub="Project configuration and access" />

      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="rounded-lg border px-4 py-2 text-[13px] transition-colors"
            style={{
              borderColor: tab === t ? "transparent" : c.edge,
              background: tab === t ? c.panelAlt : "transparent",
              color: tab === t ? c.ink : c.inkDim,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 max-w-2xl">
        {tab === "Project" && (
          <Card>
            <form onSubmit={save}>
              <h2 className="text-[15px] font-semibold">Project details</h2>
              <label className="mt-5 block">
                <span className="text-[13px]" style={{ color: c.inkDim }}>
                  Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-[13.5px] outline-none"
                  style={{ borderColor: c.edge, background: c.panelAlt, color: c.ink }}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[13px]" style={{ color: c.inkDim }}>
                  Slug
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="font-mono text-[13px]" style={{ color: c.inkFaint }}>
                    console.app/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                    className="flex-1 rounded-lg border px-3.5 py-2.5 font-mono text-[13.5px] outline-none"
                    style={{ borderColor: c.edge, background: c.panelAlt, color: c.ink }}
                  />
                </div>
              </label>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg px-5 py-2.5 text-[13.5px] font-medium text-white"
                  style={{ background: c.accent }}
                >
                  Save changes
                </button>
                {saved && (
                  <span role="status" className="text-[13px]" style={{ color: c.accent }}>
                    Saved
                  </span>
                )}
              </div>
            </form>
          </Card>
        )}

        {tab === "Notifications" && (
          <Card>
            <h2 className="text-[15px] font-semibold">Alerts</h2>
            <div className="mt-4">
              {(
                [
                  ["errors", "Error rate above 1%"],
                  ["latency", "p95 latency above 500ms"],
                  ["weekly", "Weekly usage digest"],
                  ["billing", "Invoice and payment events"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between py-3.5"
                  style={{ borderBottom: `1px solid ${c.edge}` }}
                >
                  <span className="text-[13.5px]">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alerts[key]}
                    aria-label={label}
                    onClick={() => setAlerts((a) => ({ ...a, [key]: !a[key] }))}
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ background: alerts[key] ? c.accent : c.panelAlt }}
                  >
                    <span
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                      style={{ left: alerts[key] ? 22 : 2 }}
                    />
                  </button>
                </label>
              ))}
            </div>
          </Card>
        )}

        {tab === "API keys" && (
          <Card>
            <h2 className="text-[15px] font-semibold">API keys</h2>
            <div className="mt-4">
              {KEYS.map((k) => (
                <div
                  key={k.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                  style={{ borderBottom: `1px solid ${c.edge}` }}
                >
                  <div className="min-w-0">
                    <div className="text-[13.5px]">{k.label}</div>
                    <div className="mt-1 font-mono text-[12.5px]" style={{ color: c.inkFaint }}>
                      {revealed === k.id ? k.value : "sk_••••••••••••••••"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRevealed(revealed === k.id ? null : k.id)}
                      className="rounded-lg border px-3 py-1.5 text-[12.5px]"
                      style={{ borderColor: c.edge, color: c.inkDim }}
                    >
                      {revealed === k.id ? "Hide" : "Reveal"}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-1.5 text-[12.5px]"
                      style={{ borderColor: c.edge, color: c.danger }}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px]" style={{ color: c.inkFaint }}>
              Keys are shown once on creation. These are placeholders.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

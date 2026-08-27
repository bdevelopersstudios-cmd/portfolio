"use client";

import { useMemo, useState } from "react";

/**
 * Console — an analytics dashboard.
 *
 * The chart is raw SVG on purpose. A charting library is the dependency most
 * likely to break on a major-version bump and the hardest to restyle to a
 * brand, and an area chart with a hover readout is roughly forty lines of
 * path maths. Everything here is editable without learning an API.
 */

type Theme = "dark" | "light";

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    bg: "#0a0c10",
    panel: "#12151c",
    panelAlt: "#171b24",
    edge: "rgba(255,255,255,0.08)",
    ink: "#eef1f6",
    inkDim: "rgba(238,241,246,0.62)",
    inkFaint: "rgba(238,241,246,0.36)",
    accent: "#10b981",
    accent2: "#0ea5e9",
    warn: "#f59e0b",
    danger: "#f43f5e",
  },
  light: {
    bg: "#f6f7f9",
    panel: "#ffffff",
    panelAlt: "#f1f3f6",
    edge: "rgba(10,12,16,0.09)",
    ink: "#0d1117",
    inkDim: "rgba(13,17,23,0.62)",
    inkFaint: "rgba(13,17,23,0.42)",
    accent: "#059669",
    accent2: "#0284c7",
    warn: "#d97706",
    danger: "#e11d48",
  },
};

const SERIES = [
  1840, 2120, 1990, 2460, 2310, 2780, 3120, 2940, 3380, 3610, 3420, 3980, 4220, 4050, 4610, 4880,
  4720, 5240, 5510, 5380, 5920, 6180, 6040, 6620,
];

const METRICS = [
  { label: "Active users", value: "6,620", delta: "+12.4%", up: true },
  { label: "Events / day", value: "184k", delta: "+8.1%", up: true },
  { label: "Error rate", value: "0.42%", delta: "−0.18%", up: false, good: true },
  { label: "p95 latency", value: "218ms", delta: "+14ms", up: true, good: false },
];

type Row = {
  id: string;
  endpoint: string;
  calls: number;
  p95: number;
  errors: number;
  status: "healthy" | "degraded" | "down";
};

const ROWS: Row[] = [
  { id: "r1", endpoint: "POST /v1/events", calls: 184230, p95: 218, errors: 0.42, status: "healthy" },
  { id: "r2", endpoint: "GET /v1/projects", calls: 92410, p95: 96, errors: 0.08, status: "healthy" },
  { id: "r3", endpoint: "POST /v1/ingest", calls: 76180, p95: 612, errors: 2.71, status: "degraded" },
  { id: "r4", endpoint: "GET /v1/usage", calls: 41060, p95: 141, errors: 0.19, status: "healthy" },
  { id: "r5", endpoint: "POST /v1/webhooks", calls: 28840, p95: 1840, errors: 9.4, status: "down" },
  { id: "r6", endpoint: "GET /v1/members", calls: 19220, p95: 88, errors: 0.02, status: "healthy" },
  { id: "r7", endpoint: "PATCH /v1/billing", calls: 8140, p95: 324, errors: 1.12, status: "degraded" },
];

const NAV = [
  { label: "Overview", icon: "▤", active: true },
  { label: "Traffic", icon: "◴", active: false },
  { label: "Errors", icon: "⚠", active: false },
  { label: "Billing", icon: "▦", active: false },
  { label: "Team", icon: "◎", active: false },
  { label: "Settings", icon: "⚙", active: false },
];

type SortKey = "endpoint" | "calls" | "p95" | "errors";

/** Builds the area path and the line path for the series, in one pass. */
function chartPaths(values: number[], w: number, h: number, pad = 6) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`;
  return { line, area, points };
}

export function Console() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "calls", dir: -1 });
  const [hover, setHover] = useState<number | null>(null);

  const c = THEMES[theme];
  const W = 720;
  const H = 220;
  const { line, area, points } = useMemo(() => chartPaths(SERIES, W, H), []);

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

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: -1 }));

  const statusColor = (s: Row["status"]) =>
    s === "healthy" ? c.accent : s === "degraded" ? c.warn : c.danger;

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ background: c.bg, color: c.ink }}
    >
      <div className="flex min-h-screen">
        <aside
          className="hidden shrink-0 border-r transition-[width] duration-300 sm:block"
          style={{ borderColor: c.edge, background: c.panel, width: collapsed ? 68 : 232 }}
        >
          <div className="flex h-16 items-center gap-2.5 px-5" style={{ borderBottom: `1px solid ${c.edge}` }}>
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }}
            >
              C
            </span>
            {!collapsed && <span className="text-[15px] font-semibold tracking-tight">Console</span>}
          </div>

          <nav className="p-3">
            {NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={{
                  background: item.active ? c.panelAlt : "transparent",
                  color: item.active ? c.ink : c.inkDim,
                }}
                aria-current={item.active ? "page" : undefined}
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-center opacity-70">
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </button>
            ))}
          </nav>

          <div className="px-3">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors"
              style={{ color: c.inkFaint }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-center">
                {collapsed ? "»" : "«"}
              </span>
              {!collapsed && "Collapse"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header
            className="sticky top-0 z-20 flex h-16 items-center gap-3 px-5 backdrop-blur-xl sm:px-7"
            style={{ borderBottom: `1px solid ${c.edge}`, background: `${c.bg}d9` }}
          >
            <label className="relative flex-1 sm:max-w-md">
              <span className="sr-only">Filter endpoints</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter endpoints…"
                className="w-full rounded-lg border px-3.5 py-2 text-[13.5px] outline-none transition-colors placeholder:opacity-50 focus:border-current"
                style={{ borderColor: c.edge, background: c.panel, color: c.ink }}
              />
            </label>

            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="ml-auto rounded-lg border px-3 py-2 text-[12px] transition-colors"
              style={{ borderColor: c.edge, color: c.inkDim }}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </button>

            <span
              className="hidden h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white sm:grid"
              style={{ background: `linear-gradient(135deg, ${c.accent2}, ${c.accent})` }}
            >
              MS
            </span>
          </header>

          <div className="px-5 pb-24 pt-7 sm:px-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Overview</h1>
                <p className="mt-1 text-[13.5px]" style={{ color: c.inkDim }}>
                  Last 24 hours · updated 2 minutes ago
                </p>
              </div>
              <div className="flex gap-2">
                {["24h", "7d", "30d"].map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    className="rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors"
                    style={{
                      borderColor: i === 0 ? "transparent" : c.edge,
                      background: i === 0 ? c.accent : "transparent",
                      color: i === 0 ? "#fff" : c.inkDim,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {METRICS.map((m) => {
                const positive = m.good ?? m.up;
                return (
                  <div
                    key={m.label}
                    className="rounded-xl border p-4"
                    style={{ borderColor: c.edge, background: c.panel }}
                  >
                    <div className="text-[12px]" style={{ color: c.inkFaint }}>
                      {m.label}
                    </div>
                    <div className="mt-2 text-[26px] font-semibold tracking-tight">{m.value}</div>
                    <div
                      className="mt-1 text-[12px] font-medium"
                      style={{ color: positive ? c.accent : c.danger }}
                    >
                      {m.delta}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-3 rounded-xl border p-5"
              style={{ borderColor: c.edge, background: c.panel }}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold">Active users</h2>
                <span className="font-mono text-[12px]" style={{ color: c.inkFaint }}>
                  {hover === null ? "hover the chart" : `${SERIES[hover].toLocaleString()} @ ${hover}:00`}
                </span>
              </div>

              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mt-4 w-full"
                style={{ height: "auto" }}
                role="img"
                aria-label="Active users over the last 24 hours"
                onMouseLeave={() => setHover(null)}
              >
                <defs>
                  <linearGradient id="console-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.accent} stopOpacity="0.34" />
                    <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    x2={W}
                    y1={H * f}
                    y2={H * f}
                    stroke={c.edge}
                    strokeWidth="1"
                  />
                ))}

                <path d={area} fill="url(#console-fill)" />
                <path d={line} fill="none" stroke={c.accent} strokeWidth="2.5" strokeLinejoin="round" />

                {hover !== null && (
                  <g>
                    <line
                      x1={points[hover][0]}
                      x2={points[hover][0]}
                      y1="0"
                      y2={H}
                      stroke={c.accent}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={points[hover][0]} cy={points[hover][1]} r="4.5" fill={c.accent} />
                  </g>
                )}

                {/* Invisible hit strips: one per sample, so the readout tracks
                    the pointer without needing a chart library's event layer. */}
                {points.map(([x], i) => (
                  <rect
                    key={i}
                    x={x - W / SERIES.length / 2}
                    y="0"
                    width={W / SERIES.length}
                    height={H}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                  />
                ))}
              </svg>
            </div>

            <div
              className="mt-3 overflow-hidden rounded-xl border"
              style={{ borderColor: c.edge, background: c.panel }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[15px] font-semibold">Endpoints</h2>
                <span className="text-[12px]" style={{ color: c.inkFaint }}>
                  {rows.length} of {ROWS.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr style={{ borderTop: `1px solid ${c.edge}`, borderBottom: `1px solid ${c.edge}` }}>
                      {([
                        ["endpoint", "Endpoint"],
                        ["calls", "Calls"],
                        ["p95", "p95"],
                        ["errors", "Errors"],
                      ] as [SortKey, string][]).map(([key, label]) => (
                        <th
                          key={key}
                          className="px-5 py-3"
                          // aria-sort belongs on the header cell, not the
                          // control inside it — button has no such state.
                          aria-sort={
                            sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors"
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
                        <td
                          className="px-5 py-3.5 text-[13.5px]"
                          style={{ color: r.errors > 1 ? c.danger : c.inkDim }}
                        >
                          {r.errors}%
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize"
                            style={{ background: `${statusColor(r.status)}22`, color: statusColor(r.status) }}
                          >
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: statusColor(r.status) }}
                            />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-[13.5px]" style={{ color: c.inkFaint }}>
                          No endpoint matches “{query}”.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

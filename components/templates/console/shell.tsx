"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Console — application shell.
 *
 * Lives in the route layout rather than in each page, so the sidebar, the
 * search bar and the chosen theme survive navigation instead of resetting on
 * every route change. That persistence is the whole reason a dashboard wants
 * a layout and not a wrapper component pasted into each screen.
 */

export type Theme = "dark" | "light";

export const THEMES: Record<Theme, Record<string, string>> = {
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

type Ctx = { c: Record<string, string>; theme: Theme; query: string };
const ConsoleCtx = createContext<Ctx | null>(null);

export function useConsole() {
  const ctx = useContext(ConsoleCtx);
  if (!ctx) throw new Error("useConsole must be used inside ConsoleShell");
  return ctx;
}

const BASE = "/templates/preview/console";

const NAV = [
  { label: "Overview", href: BASE, icon: "▤" },
  { label: "Traffic", href: `${BASE}/traffic`, icon: "◴" },
  { label: "Billing", href: `${BASE}/billing`, icon: "▦" },
  { label: "Team", href: `${BASE}/team`, icon: "◎" },
  { label: "Settings", href: `${BASE}/settings`, icon: "⚙" },
];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const pathname = usePathname();
  const c = THEMES[theme];

  const isActive = (href: string) =>
    href === BASE ? pathname === BASE || pathname === `${BASE}/` : pathname?.startsWith(href);

  const nav = (
    <nav className="p-3">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileNav(false)}
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors"
            style={{
              background: active ? c.panelAlt : "transparent",
              color: active ? c.ink : c.inkDim,
            }}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true" className="w-4 shrink-0 text-center opacity-70">
              {item.icon}
            </span>
            {(!collapsed || mobileNav) && item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <ConsoleCtx.Provider value={{ c, theme, query }}>
      <div className="min-h-screen font-sans antialiased" style={{ background: c.bg, color: c.ink }}>
        <div className="flex min-h-screen">
          <aside
            className="hidden shrink-0 border-r transition-[width] duration-300 sm:block"
            style={{ borderColor: c.edge, background: c.panel, width: collapsed ? 68 : 232 }}
          >
            <div
              className="flex h-16 items-center gap-2.5 px-5"
              style={{ borderBottom: `1px solid ${c.edge}` }}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent2})` }}
              >
                C
              </span>
              {!collapsed && <span className="text-[15px] font-semibold tracking-tight">Console</span>}
            </div>

            {nav}

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

          <div className="min-w-0 flex-1">
            <header
              className="sticky top-0 z-30 flex h-16 items-center gap-3 px-4 backdrop-blur-xl sm:px-7"
              style={{ borderBottom: `1px solid ${c.edge}`, background: `${c.bg}d9` }}
            >
              <button
                type="button"
                onClick={() => setMobileNav((v) => !v)}
                className="rounded-lg border px-2.5 py-2 text-[13px] sm:hidden"
                style={{ borderColor: c.edge, color: c.inkDim }}
                aria-label="Toggle navigation"
                aria-expanded={mobileNav}
              >
                ☰
              </button>

              <label className="relative min-w-0 flex-1 sm:max-w-md">
                <span className="sr-only">Search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search endpoints, people, invoices…"
                  className="w-full rounded-lg border px-3.5 py-2 text-[13.5px] outline-none transition-colors placeholder:opacity-50"
                  style={{ borderColor: c.edge, background: c.panel, color: c.ink }}
                />
              </label>

              <button
                type="button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className="ml-auto shrink-0 rounded-lg border px-3 py-2 text-[12px] transition-colors"
                style={{ borderColor: c.edge, color: c.inkDim }}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? "☀" : "☾"}
              </button>

              <span
                className="hidden h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white sm:grid"
                style={{ background: `linear-gradient(135deg, ${c.accent2}, ${c.accent})` }}
              >
                MS
              </span>
            </header>

            {mobileNav && (
              <div className="sm:hidden" style={{ background: c.panel, borderBottom: `1px solid ${c.edge}` }}>
                {nav}
              </div>
            )}

            <main className="px-4 pb-28 pt-7 sm:px-7">{children}</main>
          </div>
        </div>
      </div>
    </ConsoleCtx.Provider>
  );
}

/** Shared page heading, so every screen in the app is framed the same way. */
export function PageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub: string;
  actions?: React.ReactNode;
}) {
  const { c } = useConsole();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="mt-1 text-[13.5px]" style={{ color: c.inkDim }}>
          {sub}
        </p>
      </div>
      {actions}
    </div>
  );
}

export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  const { c } = useConsole();
  return (
    <div
      className={`rounded-xl border ${pad ? "p-5" : ""} ${className}`}
      style={{ borderColor: c.edge, background: c.panel }}
    >
      {children}
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ACCENTS,
  ACCENT_STORAGE_KEY,
  DISCOVERED_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  accentIndex: number;
  accent: (typeof ACCENTS)[number];
  hasDiscoveredLaptop: boolean;
  toggleTheme: () => void;
  setAccent: (index: number) => void;
  cycleAccent: () => void;
  markDiscovered: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyAccent(index: number) {
  const a = ACCENTS[index];
  const root = document.documentElement;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-2", a.accent2);
  root.style.setProperty("--accent-dim", a.accentDim);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accentIndex, setAccentIndex] = useState(0);
  const [hasDiscoveredLaptop, setHasDiscoveredLaptop] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const savedAccent = Number(localStorage.getItem(ACCENT_STORAGE_KEY));
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    const initialAccent = Number.isInteger(savedAccent) && ACCENTS[savedAccent] ? savedAccent : 0;
    // localStorage doesn't exist during the static-export build, so state
    // has to start at the default and correct itself here on mount — a
    // legitimate one-time hydration read, not a derivable/effect-avoidable value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
    setAccentIndex(initialAccent);
    setHasDiscoveredLaptop(localStorage.getItem(DISCOVERED_STORAGE_KEY) === "true");
    document.documentElement.setAttribute("data-theme", initialTheme);
    applyAccent(initialAccent);
  }, []);

  const markDiscovered = useCallback(() => {
    localStorage.setItem(DISCOVERED_STORAGE_KEY, "true");
    setHasDiscoveredLaptop(true);
  }, []);

  // Note these no longer mark the laptop discovered: the theme and accent are
  // reachable from the nav and the hero's own picker now, and using one of
  // those says nothing about whether the 3D laptop has been found. Only the
  // laptop's click handler marks it, so its badge stays honest.
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setAccent = useCallback((index: number) => {
    if (!ACCENTS[index]) return;
    applyAccent(index);
    localStorage.setItem(ACCENT_STORAGE_KEY, String(index));
    setAccentIndex(index);
  }, []);

  const cycleAccent = useCallback(() => {
    setAccentIndex((prev) => {
      const next = (prev + 1) % ACCENTS.length;
      applyAccent(next);
      localStorage.setItem(ACCENT_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      accentIndex,
      accent: ACCENTS[accentIndex],
      hasDiscoveredLaptop,
      toggleTheme,
      setAccent,
      cycleAccent,
      markDiscovered,
    }),
    [theme, accentIndex, hasDiscoveredLaptop, toggleTheme, setAccent, cycleAccent, markDiscovered]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

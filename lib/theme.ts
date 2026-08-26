export type ThemeMode = "light" | "dark";

export type AccentDef = {
  name: string;
  accent: string;
  accent2: string;
  accentDim: string;
};

export const ACCENTS: AccentDef[] = [
  { name: "blue", accent: "#2f5eff", accent2: "#ff7a45", accentDim: "#2347d6" },
  { name: "violet", accent: "#7c3aed", accent2: "#a3e635", accentDim: "#6425c9" },
  { name: "emerald", accent: "#059669", accent2: "#f59e0b", accentDim: "#047a54" },
  { name: "rose", accent: "#e11d48", accent2: "#06b6d4", accentDim: "#b3123a" },
];

export const THEME_STORAGE_KEY = "portfolio-theme";
export const ACCENT_STORAGE_KEY = "portfolio-accent";

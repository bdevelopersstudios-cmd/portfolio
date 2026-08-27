export type TemplateCategory = "saas" | "dashboard" | "studio";

export type Template = {
  slug: string;
  name: string;
  category: TemplateCategory;
  tagline: string;
  description: string;
  price: number;
  tech: string[];
  /** What a buyer actually receives — the case for the price. */
  includes: string[];
  /** Distinct swatch per template, used on the store card. */
  swatch: [string, string];
  previewPath: string;
};

export const categoryLabels: Record<TemplateCategory, string> = {
  saas: "SaaS Landing",
  dashboard: "App Dashboard",
  studio: "Studio Site",
};

export const templates: Template[] = [
  {
    slug: "nimbus",
    name: "Nimbus",
    category: "saas",
    tagline: "A bento-grid SaaS launch page with live pricing logic.",
    description:
      "A complete marketing front end for a subscription product: a glass navigation bar, an oversized type hero, a bento feature grid that reflows down to one column, animated metrics, and a pricing table whose monthly/annual toggle recalculates in place. Built to be reskinned by editing one token file.",
    price: 1000,
    tech: ["Next.js 16", "React 19", "Tailwind v4", "Motion"],
    includes: [
      "7 full sections, from nav through footer",
      "Bento grid that reflows 4 → 2 → 1 across breakpoints",
      "Working monthly/annual pricing toggle with per-seat maths",
      "Scroll-reveal animation on every section",
      "Light and dark themes driven by one token set",
      "Restrained glassmorphism — nav and cards only, for the frame cost",
    ],
    swatch: ["#6366f1", "#f59e0b"],
    previewPath: "/templates/preview/nimbus",
  },
  {
    slug: "console",
    name: "Console",
    category: "dashboard",
    tagline: "An analytics dashboard with sortable data and a live chart.",
    description:
      "The screen every internal tool needs first. A collapsible sidebar, a command-style search bar, a bento row of metric cards, a hand-built SVG area chart with a hover readout, and a data table you can genuinely sort and filter. No chart library — the SVG is yours to edit.",
    price: 1000,
    tech: ["Next.js 16", "React 19", "Tailwind v4", "Zero chart deps"],
    includes: [
      "Sortable, filterable table with status states",
      "Area chart drawn in raw SVG with an interactive readout",
      "Collapsible sidebar and command-bar search",
      "Metric cards with trend deltas",
      "Dark and light, switchable at runtime",
      "No charting dependency to fight or version-bump",
    ],
    swatch: ["#10b981", "#0ea5e9"],
    previewPath: "/templates/preview/console",
  },
  {
    slug: "atelier",
    name: "Atelier",
    category: "studio",
    tagline: "An editorial studio site with kinetic type and a filtered index.",
    description:
      "For design studios and freelancers who need presence over pitch. Oversized kinetic headline, an infinite marquee, a filterable project index with hover reveals, and a warm earth-toned palette drawn from the direction 2026 actually took rather than the one the trend pieces predicted.",
    price: 1000,
    tech: ["Next.js 16", "React 19", "Tailwind v4", "Motion"],
    includes: [
      "Kinetic headline that animates per word on load",
      "Infinite marquee that pauses on hover",
      "Filterable project index with image-free hover reveals",
      "Editorial two-column story layout",
      "Warm earth palette, plus a mono-neutral alternate",
      "Every section keyboard reachable and reduced-motion aware",
    ],
    swatch: ["#c2410c", "#0f766e"],
    previewPath: "/templates/preview/atelier",
  },
];

/** Shared across all three, and the honest part of the price. */
export const commonIncludes = [
  "Full source, no build-step lock-in",
  "Responsive from 360px to ultrawide",
  "Semantic HTML and keyboard-navigable controls",
  "prefers-reduced-motion respected throughout",
  "Commented code written to be edited, not just shipped",
];

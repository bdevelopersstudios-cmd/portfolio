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
  /** Routes in the template, listed on the store card. */
  pages: string[];
  /** Distinct swatch per template, used on the store card. */
  swatch: [string, string];
  previewPath: string;
};

export const categoryLabels: Record<TemplateCategory, string> = {
  saas: "SaaS Product",
  dashboard: "App Dashboard",
  studio: "Studio Site",
};

export const templates: Template[] = [
  {
    slug: "nimbus",
    name: "Nimbus",
    category: "saas",
    tagline: "A seven-screen SaaS product, marketing through to the signed-in app.",
    description:
      "Not a landing page — the whole front end. Marketing site, a product page, a pricing page with a working comparison matrix and FAQ, a changelog, a docs section with a code browser, a validating auth screen with sign-in and sign-up, and the in-app dashboard a customer lands on afterwards. Shared nav and footer live in a route layout, so navigation is instant and state survives it.",
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
    pages: ["Landing","Product","Pricing","Changelog","Docs","Sign in / Sign up","In-app dashboard"],
    swatch: ["#6366f1", "#f59e0b"],
    previewPath: "/templates/preview/nimbus",
  },
  {
    slug: "console",
    name: "Console",
    category: "dashboard",
    tagline: "A five-screen analytics dashboard with real table, chart and form logic.",
    description:
      "A complete internal tool. Overview with a sortable endpoint table, a traffic page with region filters and dual charts, billing with a seat calculator and invoice history, team management where you can genuinely invite, re-role and remove people, and tabbed settings with toggles and revealable API keys. The sidebar, search and theme sit in a route layout so they persist as you move between screens.",
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
    pages: ["Overview","Traffic","Billing","Team","Settings"],
    swatch: ["#10b981", "#0ea5e9"],
    previewPath: "/templates/preview/console",
  },
  {
    slug: "atelier",
    name: "Atelier",
    category: "studio",
    tagline: "An eleven-route studio site with dynamic case studies and a validating form.",
    description:
      "A full editorial site. Kinetic home page, a filterable work index, six individually routed case studies generated from one data file, a studio page with process and team, a journal index, and a contact form with per-field validation and a success state. The case studies are a dynamic route pre-rendered at build time, so they stay static while remaining data-driven.",
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
    pages: ["Home","Work index","Case study (×6)","Studio","Journal","Contact"],
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

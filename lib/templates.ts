export type TemplateCategory = "bubble" | "nextjs" | "figma";

export type Template = {
  slug: string;
  name: string;
  category: TemplateCategory;
  tagline: string;
  description: string;
  price: number;
  tech: string[];
};

export const categoryLabels: Record<TemplateCategory, string> = {
  bubble: "Bubble.io",
  nextjs: "Next.js",
  figma: "Figma",
};

export const templates: Template[] = [
  {
    slug: "saas-starter",
    name: "SaaS Starter",
    category: "bubble",
    tagline: "A no-code SaaS foundation with auth, billing, and a dashboard.",
    description:
      "A Bubble.io starting point for subscription products: signup/login, a Stripe-connected pricing page, a settings panel, and a dashboard shell — the plumbing every SaaS needs before the actual product work begins.",
    price: 49,
    tech: ["Bubble.io", "Stripe"],
  },
  {
    slug: "launch-kit",
    name: "Launch Kit",
    category: "nextjs",
    tagline: "A fast, animated marketing site template.",
    description:
      "A Next.js + Tailwind marketing site template: hero, features, pricing, and contact sections with scroll animations built in, structured the same way this portfolio is — easy to reskin for a product launch.",
    price: 39,
    tech: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    slug: "dashboard-ui-kit",
    name: "Dashboard UI Kit",
    category: "figma",
    tagline: "A componentized dashboard design system.",
    description:
      "A Figma file of dashboard components — nav, tables, charts, forms, and empty states — built with variants and auto-layout so a real product screen assembles from existing pieces instead of starting blank.",
    price: 29,
    tech: ["Figma"],
  },
];

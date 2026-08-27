/**
 * Services — packages, pricing and process.
 *
 * PRICES ARE PLACEHOLDERS. They are all in this file so you can set them in
 * one place. They read as "from", which is the honest framing for scoped work
 * and leaves room to quote properly once you know the shape of a project.
 */

export type Service = {
  slug: string;
  name: string;
  /** The problem this solves, in the client's words rather than yours. */
  hook: string;
  summary: string;
  from: number;
  timeline: string;
  includes: string[];
  bestFor: string;
  /** Kept honest: what this package is explicitly not. */
  notIncluded?: string;
  featured?: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "mvp-sprint",
    name: "MVP Sprint",
    hook: "You need something real in front of users, not another six-month build.",
    summary:
      "A working product with auth, a database and the one workflow that matters — built in whichever stack gets you there fastest. If validating quickly is the goal, that is often Bubble. If you already know the shape of the thing, it is Next.js and Supabase.",
    from: 3500,
    timeline: "2–4 weeks",
    bestFor: "Founders validating an idea, or a team that needs an internal tool this quarter.",
    includes: [
      "Discovery call and a written scope you approve before anything is built",
      "Auth, database schema and the core workflow end to end",
      "Responsive across phone, tablet and desktop",
      "Deployed and live, with the accounts in your name",
      "A handover call and the source, yours outright",
    ],
    notIncluded: "Native mobile apps, and anything requiring a licence I would have to buy on your behalf.",
    featured: true,
  },
  {
    slug: "nocode-migration",
    name: "No-Code Migration",
    hook: "Bubble got you here. It will not get you where you are going.",
    summary:
      "Moving a working no-code product onto a real codebase without stopping the business. I hold a Bubble.io certification and two years of production no-code work behind it, then rebuilt on Next.js and Supabase — so I can read what you have and know what it becomes.",
    from: 6000,
    timeline: "4–8 weeks",
    bestFor: "Products hitting the ceiling on price, performance or a feature the platform will not do.",
    includes: [
      "Audit of the existing app, written up as what maps across and what does not",
      "Database schema designed properly, with a migration path for live data",
      "Rebuilt feature by feature so you can compare against the original",
      "Billing and plan logic enforced at the database, not just the interface",
      "Cutover plan, and I am on hand the week either side of it",
    ],
    notIncluded: "A pixel-identical clone — a rebuild is the moment to fix what was working around the platform.",
  },
  {
    slug: "performance-rescue",
    name: "Performance & Infrastructure",
    hook: "It works. It is just slow, expensive, or both.",
    summary:
      "Finding where the weight and the cost actually are, then removing them. On my last migration this meant taking the heaviest page from 28MB to 0.72MB and moving Stripe and geolocation onto Cloudflare Workers.",
    from: 2000,
    timeline: "1–3 weeks",
    bestFor: "A live product with a real audience and a mobile experience that is losing them.",
    includes: [
      "Measured audit — payload, Core Web Vitals, database queries, hosting spend",
      "A prioritised list, with the cost and effect of each item stated",
      "The fixes implemented, not just recommended",
      "Before-and-after numbers you can show someone",
      "Framework and runtime upgrades where they are what is holding you back",
    ],
  },
  {
    slug: "retainer",
    name: "Ongoing Development",
    hook: "You have a product and no engineer to keep shipping it.",
    summary:
      "A recurring block of my week — features, fixes, migrations and the maintenance nobody plans for. Same person every month, so nothing has to be re-explained.",
    from: 2200,
    timeline: "Monthly, cancel with 30 days",
    bestFor: "Funded teams without an in-house developer, and agencies needing a reliable build partner.",
    includes: [
      "An agreed number of days a month, planned together",
      "Direct line — Slack, WhatsApp or email, no ticket queue",
      "Dependency and security updates kept current",
      "Priority on anything that breaks in production",
      "A monthly note on what shipped and what it cost",
    ],
  },
];

export const PROCESS = [
  {
    n: "01",
    title: "A call, and a written scope",
    body: "Thirty minutes on what you are actually trying to do. You get a written scope with a price and a date before you commit to anything, and if I think you need something other than what you asked for, this is where I say so.",
  },
  {
    n: "02",
    title: "Build, in the open",
    body: "You get a link to the work in progress from day one, not a reveal at the end. Updates twice a week, and you can see the deployed state whenever you like.",
  },
  {
    n: "03",
    title: "Handover you actually own",
    body: "Source, accounts, database and deployment all in your name. A call to walk through it, and written notes so the next person is not starting from nothing.",
  },
  {
    n: "04",
    title: "Two weeks of cover",
    body: "Anything broken that I built, I fix — no charge, for two weeks after handover. Beyond that there is a retainer if you want one, and no obligation if you do not.",
  },
];

export const FAQ: [string, string][] = [
  [
    "How do you charge?",
    "Fixed price per scoped phase, not hourly. You know the number before work starts, and if the scope changes we agree the difference in writing before I build it.",
  ],
  [
    "What are your hours?",
    "I am in Pakistan (UTC+5) and keep several hours of overlap with both European and US-East working days. Most clients get same-day replies.",
  ],
  [
    "Do you work with agencies?",
    "Yes, including white-label. I have worked as the build side of other people's client relationships and am comfortable staying invisible.",
  ],
  [
    "What if I only need part of this?",
    "Then buy part of it. The phases are separable and each one ends with something you own. If phase one is all you need, stop there.",
  ],
  [
    "Can you take over an unfinished project?",
    "Often, yes — but the first paid step is an audit, because inheriting a codebase without reading it properly is how estimates go wrong.",
  ],
];

export function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

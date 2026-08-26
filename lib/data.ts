export const profile = {
  name: "Mohammad Usman Saud",
  role: "Full-Stack Developer",
  tagline: "React, Next.js, Supabase, Stripe — and a Bubble.io build history to match.",
  location: "Lahore, Punjab, Pakistan",
  email: "mohammadusmansaud@gmail.com",
  github: "https://github.com/MohammadUsmanSaud",
  linkedin: "https://linkedin.com/in/mohammad-usman-saud-63293525b",
};

export const about = {
  paragraphs: [
    "I'm a full-stack developer who works across the entire product lifecycle — pixel-perfect Figma builds on one end, production database architecture on the other. My daily stack is React, Next.js, Supabase, and Stripe, alongside a Bubble.io certification from years spent shipping no-code MVPs.",
    "Most recently I built a weather-and-scheduling platform end to end: world clock, meeting planner, timezone converter, event scheduler, forecast tools, and roughly 976 dynamic city pages, wrapped in a six-tier paid-plan system with team accounts and a notification engine — enforced at the database level, not just the UI.",
  ],
  facts: [
    { label: "Based in", value: "Lahore, Pakistan" },
    { label: "Focus", value: "React / Next.js / Supabase" },
    { label: "Also fluent in", value: "Bubble.io, Figma-to-code" },
    { label: "Currently", value: "Freelance + long-term contracts" },
  ],
};

export type WorkFeature = {
  index: string;
  title: string;
  description: string;
  points: string[];
  stack: string[];
};

export const work: WorkFeature[] = [
  {
    index: "01",
    title: "Weather & Scheduling Platform",
    description:
      "Built essentially the whole application, solo: World Clock, Meeting Planner with a compare/timetable flow, Time Zone Converter, Event Scheduler, Forecast, Current & Worldwide Weather, plus blog/news sections and auth — capped off with ~976 dynamic city pages.",
    points: [
      "Pixel-perfect Figma implementations pulling assets straight from the Figma API",
      "Login, signup, and password-reset flows built from a handover doc through production",
      "976 dynamic city pages generated and shipped alongside the core tools",
    ],
    stack: ["Next.js", "React", "Supabase", "PostgreSQL", "Figma API"],
  },
  {
    index: "02",
    title: "Six-Tier Plan System & Notification Engine",
    description:
      "Designed and shipped an entire paid-plan system across four audit passes: a six-tier capability model that fails closed on unknown plan names, team accounts with roles and seat limits, one-account-one-device enforcement, and a full notification engine.",
    points: [
      "Event reminders at 3 days / 1 day / 1 hour, meeting reminders at 30 minutes, severe-weather alerts capped at 10/day",
      "Per-recipient time-zone localization on every notification",
      "Moved enforcement from client-side checks into database triggers after finding a direct API call could bypass the UI",
    ],
    stack: ["Stripe", "PostgreSQL Triggers", "Supabase Realtime"],
  },
  {
    index: "03",
    title: "Cloudflare Migration & Performance",
    description:
      "Led the framework and runtime migration: Next.js 14 to 15, React 18 to 19, and ported Stripe and geolocation logic to the Workers runtime — while cutting the heaviest page's asset weight by 97%.",
    points: [
      "Next.js 14 → 15 and React 18 → 19 upgraded across the full app",
      "Stripe and geolocation logic ported to Cloudflare Workers",
      "/about page assets cut from 28MB to 0.72MB",
    ],
    stack: ["Cloudflare Workers", "Next.js", "React 19"],
  },
];

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
};

export const experience: ExperienceItem[] = [
  {
    role: "Full-Stack Developer",
    company: "Freelance",
    period: "May 2026–Present",
    location: "Lahore, Pakistan · Remote",
    summary:
      "Owns a weather-and-scheduling platform end to end, from Figma handover through production database migrations.",
    highlights: [
      "Built the World Clock, Meeting Planner, Time Zone Converter, Event Scheduler, and weather tools that make up the core product",
      "Designed the six-tier plan/feature-gating system and moved enforcement into database triggers",
      "Applied 9 production database migrations, created a storage bucket, and wrote 3 long-form articles directly into the database",
      "Led the Cloudflare migration (Next.js 14→15, React 18→19) and a 28MB → 0.72MB asset-weight cut",
    ],
  },
  {
    role: "Web Application Developer",
    company: "Madhupa",
    period: "Feb 2025–Present",
    location: "United States · Remote",
    summary: "Full-time Bubble.io development alongside JavaScript and HTML work.",
    highlights: ["JavaScript, HTML, and Bubble.io workflow and UI builds"],
  },
  {
    role: "Web Application Developer",
    company: "Chakor",
    period: "Jan 2023–Feb 2025",
    location: "Lahore, Pakistan · On-site",
    summary:
      "Two years building client-facing templates and plugins on Bubble.io, translating Figma designs into responsive, user-facing product.",
    highlights: [
      "Delivered templates and plugins used by both individual users and established companies",
      "Translated Figma designs into responsive, production-ready builds",
      "Worked OCR plugin integrations into client projects",
    ],
  },
  {
    role: "Internship Trainee",
    company: "Punjab Information Technology Board (PITB)",
    period: "Sep 2022–Dec 2022",
    location: "Contract",
    summary: "Front-end foundations: HTML, CSS, Bootstrap, and JavaScript.",
    highlights: [
      "Built multiple websites and dashboards with HTML, CSS, and JavaScript",
      "Implemented responsiveness improvements across existing pages",
    ],
  },
];

export const skillGroups = [
  {
    label: "Frontend",
    skills: ["React.js", "Next.js", "JavaScript", "CSS", "Bootstrap", "HTML"],
  },
  {
    label: "Backend & Data",
    skills: ["Supabase", "PostgreSQL", "Database Triggers", "OCR"],
  },
  {
    label: "Infra & Payments",
    skills: ["Cloudflare Workers", "Stripe"],
  },
  {
    label: "No-Code & Design",
    skills: ["Bubble.io", "Figma", "Figma API"],
  },
];

export const certifications = [
  { title: "Bubble.io Certification", issuer: "Bubble", date: "Feb 2025" },
  { title: "Bubble.io Certification", issuer: "Bubble", date: "Dec 2023" },
];

export const education = {
  school: "University of Central Punjab",
  degree: "Bachelor's Degree, Computer Science",
  period: "Mar 2018–Mar 2022",
};

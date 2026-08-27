/**
 * The site assistant's knowledge and matching.
 *
 * WHY THIS IS RETRIEVAL AND NOT AN LLM
 * This site is a static export on GitHub Pages — there is no server. Calling
 * a model from the browser means shipping the API key in client JavaScript,
 * where anyone can read it out of the bundle and spend against the account.
 * That is not a trade-off worth making for a scoped site bot.
 *
 * It also happens to be the better tool for the brief. Every answer here is
 * written from the site's own content, so the assistant cannot invent a rate,
 * a technology or a client that does not exist, and it cannot be talked into
 * discussing anything else — there is nothing else in it to reach.
 */

export type Answer = {
  id: string;
  /** Weighted heavily: a match here is close to decisive. */
  keywords: string[];
  /** Multi-word phrases, worth more than the sum of their tokens. */
  phrases?: string[];
  reply: string;
  links?: { label: string; href: string }[];
  followUps?: string[];
};

export const GREETING =
  "Hello. I answer questions about Usman's work — his services and rates, the templates, the free tools, his background, and how to get in touch. Ask away, or pick one of these.";

export const OPENERS = [
  "What services do you offer?",
  "How much does a project cost?",
  "What's your tech stack?",
  "Are you available for work?",
];

/** Off-topic requests get this, plus a nudge back to what it does know. */
export const OFF_TOPIC = [
  "That is outside what I cover, I am afraid — I only answer questions about Usman's work and this site.",
  "I cannot help with that one. I am limited to Usman's services, templates, tools and background.",
  "That is not something I know about. Ask me about the work, the pricing, or the tools instead.",
];

export const NO_MATCH =
  "I did not quite catch that. I can talk about services and pricing, the templates, the free tools, Usman's background and experience, or how to reach him — try one of those, or email him directly.";

export const KB: Answer[] = [
  {
    id: "services",
    keywords: ["service", "services", "offer", "offering", "do", "provide", "help", "packages", "package", "work"],
    phrases: ["what do you do", "what services", "can you help", "what do you offer"],
    reply:
      "Four packages. **MVP Sprint** (from $3,500, 2–4 weeks) gets a real product in front of users. **No-Code Migration** (from $6,000, 4–8 weeks) moves a working Bubble app onto Next.js and Supabase. **Performance & Infrastructure** (from $2,000, 1–3 weeks) finds where the weight and cost are and removes them. **Ongoing Development** (from $2,200/month) is a recurring block of the week. Everything is fixed-price per scoped phase, with a written scope before any work starts.",
    links: [{ label: "See all services", href: "/services" }],
    followUps: ["How does an engagement run?", "What is the no-code migration?", "How do I hire you?"],
  },
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "costs", "rate", "rates", "charge", "budget", "expensive", "much", "fee", "quote", "hourly"],
    phrases: ["how much", "what does it cost", "what do you charge", "your rates"],
    reply:
      "Projects are fixed-price per scoped phase rather than hourly, so the number is known before work starts. Starting points: Performance & Infrastructure from $2,000, Ongoing Development from $2,200 a month, MVP Sprint from $3,500, No-Code Migration from $6,000. If the scope changes mid-project, the difference is agreed in writing before it gets built. The templates are $1,000 each.",
    links: [{ label: "Full pricing", href: "/services" }],
    followUps: ["What services do you offer?", "What is included?", "How do I hire you?"],
  },
  {
    id: "process",
    keywords: ["process", "engagement", "how", "runs", "work", "timeline", "steps", "start", "onboarding", "delivery"],
    phrases: ["how do you work", "how does it work", "what is the process", "how long"],
    reply:
      "Four steps, every time. A thirty-minute call and a **written scope** with a price and a date before you commit. Then the build happens **in the open** — you get a link to the work in progress from day one and updates twice a week. **Handover** puts source, accounts, database and deployment in your name, with written notes. Then **two weeks of cover**: anything broken that Usman built gets fixed at no charge.",
    links: [{ label: "How an engagement runs", href: "/services" }],
    followUps: ["How much does a project cost?", "What services do you offer?"],
  },
  {
    id: "migration",
    keywords: ["bubble", "nocode", "no-code", "migrate", "migration", "rebuild", "outgrow", "webflow", "platform"],
    phrases: ["bubble to next", "no code", "move off bubble", "rebuild my app"],
    reply:
      "This is the unusual part of Usman's background. He holds a **Bubble.io certification** and has two years of production no-code work behind it, and he now ships React, Next.js, Supabase and Stripe. So he can read what you already have and knows what it should become. The migration package runs 4–8 weeks from $6,000: an audit of the existing app, a properly designed schema with a path for live data, a feature-by-feature rebuild, and a cutover plan he is on hand for.",
    links: [{ label: "Migration details", href: "/services" }],
    followUps: ["How much does a project cost?", "What's your tech stack?"],
  },
  {
    id: "stack",
    keywords: ["stack", "tech", "technology", "technologies", "language", "languages", "framework", "tools", "react", "next", "nextjs", "supabase", "postgres", "postgresql", "stripe", "cloudflare", "typescript", "javascript", "figma", "skills", "know"],
    phrases: ["tech stack", "what technologies", "what do you use", "what languages"],
    reply:
      "Day to day: **React, Next.js, Supabase, PostgreSQL and Stripe**, with Cloudflare Workers for edge work. Also JavaScript, CSS, Bootstrap and HTML on the front end; database triggers and OCR on the back; and Bubble.io plus Figma and the Figma API on the no-code and design side.",
    links: [{ label: "Full skill list", href: "/#skills" }],
    followUps: ["What have you built?", "What services do you offer?"],
  },
  {
    id: "projects",
    keywords: ["project", "projects", "built", "build", "portfolio", "case", "study", "example", "examples", "shipped", "weather", "scheduling", "plan", "notification", "performance"],
    phrases: ["what have you built", "show me your work", "case studies", "past work"],
    reply:
      "Three that stand out. A **weather and scheduling platform** built solo end to end — world clock, meeting planner, timezone converter, event scheduler, forecast tools and roughly **976 dynamic city pages**. A **six-tier paid-plan system** with team accounts, seat limits and a notification engine, where enforcement was moved into database triggers after a direct API call was found to bypass the UI. And a **Cloudflare migration** — Next.js 14→15, React 18→19, with the heaviest page cut from **28MB to 0.72MB**.",
    links: [{ label: "Selected work", href: "/#work" }],
    followUps: ["What's your tech stack?", "How much experience do you have?"],
  },
  {
    id: "experience",
    keywords: ["experience", "years", "background", "history", "career", "senior", "junior", "long", "cv", "resume", "education", "degree", "university"],
    phrases: ["how long have you", "how many years", "your background", "about you"],
    reply:
      "Shipping production work since **September 2022**. Currently freelance on the weather-and-scheduling platform, and at Madhupa (US, remote) doing Bubble.io alongside JavaScript and HTML. Before that, two years at Chakor building client-facing templates and plugins on Bubble.io, and a front-end internship at the Punjab Information Technology Board. Bachelor's in Computer Science from the University of Central Punjab, plus two Bubble.io certifications.",
    links: [{ label: "Full history", href: "/#experience" }],
    followUps: ["What have you built?", "Are you available for work?"],
  },
  {
    id: "availability",
    keywords: ["available", "availability", "hire", "hiring", "free", "capacity", "book", "booking", "start", "taking", "clients", "contract", "freelance", "fulltime", "full-time"],
    phrases: ["are you available", "can i hire", "taking clients", "start a project", "work with you"],
    reply:
      "Yes — Usman is available for new work, on both project and long-term contracts, and works with agencies including white-label. The fastest route is email with a short description of the problem; he reads everything himself.",
    links: [
      { label: "Start a conversation", href: "/#contact" },
      { label: "See services", href: "/services" },
    ],
    followUps: ["How much does a project cost?", "Where are you based?"],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "reach", "touch", "message", "call", "linkedin", "github", "talk", "connect"],
    phrases: ["how do i contact", "get in touch", "reach you", "email address"],
    reply:
      "Email **mohammadusmansaud@gmail.com** — that is the fastest route and it goes straight to him. He is also on LinkedIn and GitHub, both linked from the contact section.",
    links: [{ label: "Contact section", href: "/#contact" }],
    followUps: ["Are you available for work?", "Where are you based?"],
  },
  {
    id: "location",
    keywords: ["where", "based", "located", "location", "country", "city", "timezone", "time", "zone", "remote", "pakistan", "lahore", "hours", "overlap"],
    phrases: ["where are you", "what timezone", "do you work remotely", "based in"],
    reply:
      "Lahore, Pakistan, working remotely — **UTC+5**. That keeps several hours of overlap with both European and US-East working days, and most clients get same-day replies.",
    followUps: ["Are you available for work?", "How do I contact you?"],
  },
  {
    id: "templates",
    // "buy"/"purchase" deliberately absent — they belong to the entry below,
    // which answers whether you can actually check out yet.
    keywords: ["template", "templates", "product", "products", "nimbus", "console", "atelier", "store", "shop", "1000"],
    phrases: ["what templates", "template price", "how many templates"],
    reply:
      "Three, at **$1,000 each**, and each is a complete multi-page front end rather than a single landing page. **Nimbus** is a seven-screen SaaS product — marketing, pricing, changelog, docs, auth and an in-app dashboard. **Console** is a five-screen analytics dashboard with real table, chart and form logic. **Atelier** is an eleven-page studio site with dynamic case studies. All three have live previews you can click through.",
    links: [{ label: "Browse templates", href: "/templates" }],
    followUps: ["Can I buy a template now?", "What services do you offer?"],
  },
  {
    id: "template-purchase",
    // Owns "template" too, so a purchase question outranks the catalogue.
    keywords: ["buy", "checkout", "payment", "pay", "purchase", "order", "card", "stripe", "paypal", "template", "templates"],
    phrases: ["can i buy", "how do i buy", "buy now", "is it for sale", "buy a template", "purchase a template"],
    reply:
      "Not through the site yet — checkout is not wired up, so the templates are marked as launching soon rather than pretending to sell. If you want one now, email Usman directly and he will sort it out with you.",
    links: [
      { label: "See the templates", href: "/templates" },
      { label: "Email about a template", href: "/#contact" },
    ],
    followUps: ["What templates are there?"],
  },
  {
    id: "tools",
    keywords: ["tool", "tools", "free", "convert", "converter", "pdf", "ocr", "image", "compress", "merge", "split", "favicon", "palette", "svg", "watermark", "rotate"],
    phrases: ["free tools", "what tools", "convert a pdf", "convert images"],
    reply:
      "Fifteen free file tools, all of which run **entirely in your browser** — the file never leaves your device, so there is no queue, no size cap and no account. Images: convert, compress, images-to-PDF. PDF: to images, merge, split, rotate, remove pages, page numbers, watermark. Design: favicon generator, colour palette, SVG to PNG. Plus text extraction and OCR for scans.",
    links: [{ label: "Open the tools", href: "/tools" }],
    followUps: ["Are the tools really private?", "Can you build this into my product?"],
  },
  {
    id: "tools-privacy",
    // "tool"/"tools" repeat from the entry above on purpose: an entry has to
    // own the words that identify it, or a two-word question like "tools
    // private" ties with the general tools answer and order decides it.
    keywords: ["tool", "tools", "private", "privacy", "secure", "security", "upload", "uploaded", "safe", "data", "server", "store", "stored", "confidential"],
    phrases: ["is it private", "do you store", "are files uploaded", "is it safe"],
    reply:
      "Nothing is uploaded. The site is a static export with **no server to upload to** — every tool does its work in your browser tab using the Canvas API, pdf-lib, pdf.js and Tesseract's WebAssembly build. Your file never crosses the network, which is also why there is no size limit and no sign-up.",
    links: [{ label: "Try them", href: "/tools" }],
    followUps: ["What tools are there?"],
  },
  {
    id: "tools-in-product",
    keywords: ["integrate", "integration", "api", "product", "embed", "build", "custom", "pipeline", "automate", "bulk"],
    phrases: ["in my product", "build this for me", "can you integrate", "document pipeline"],
    reply:
      "Yes — this is normal client work. Image processing at upload, PDF generation for invoices and statements, and OCR intake pipelines are all things Usman has built into products; his CV includes OCR plugin integrations on client projects. It would usually start as an MVP Sprint or fall under ongoing development.",
    links: [{ label: "See services", href: "/services" }],
    followUps: ["How much does a project cost?", "How does an engagement run?"],
  },
  {
    id: "site",
    keywords: ["site", "website", "portfolio", "made", "built", "this", "3d", "laptop", "hero", "animation", "background"],
    phrases: ["this site", "how was this built", "what is this built with", "the laptop"],
    reply:
      "Next.js 16 with React 19 and Tailwind v4, statically exported. The hero laptop is React Three Fiber — click it to switch theme, and the swatches under the copy change the accent. The background is a scroll-driven mesh gradient in plain CSS. Everything is client-side, which is what makes the tools work without a server.",
    followUps: ["What's your tech stack?", "What tools are there?"],
  },
];

/* ------------------------------------------------------------------ matcher */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "you", "your", "yours", "i",
  "me", "my", "we", "he", "his", "him", "it", "its", "to", "of", "for", "in", "on", "at", "and",
  "or", "but", "with", "about", "can", "could", "would", "should", "will", "have", "has", "had",
  "what", "whats", "how", "who", "when", "why", "which", "there", "this", "that", "please", "tell",
  "hey", "hi", "hello", "am", "be", "been", "get", "got", "any", "some", "so", "if", "from",
]);

/** Folds common phrasings onto the vocabulary the entries actually use. */
const SYNONYMS: Record<string, string> = {
  cheap: "price", costly: "price", pricey: "price", afford: "price", money: "price",
  dollar: "price", dollars: "price", usd: "price", payment: "price", invoice: "price",
  employ: "hire", recruit: "hire", onboard: "hire", engage: "hire",
  js: "javascript", ts: "typescript", nextjs: "next", reactjs: "react", postgre: "postgresql",
  db: "database", sql: "database", backend: "stack", frontend: "stack", fullstack: "stack",
  cv: "resume", bio: "about", story: "about",
  photo: "image", picture: "image", photos: "image", images: "image", pics: "image",
  docs: "pdf", document: "pdf", documents: "pdf", scan: "ocr", scanned: "ocr", scanning: "ocr",
  jpg: "image", jpeg: "image", png: "image", webp: "image",
  themes: "template", theme: "template", starter: "template", boilerplate: "template",
  chat: "contact", reach: "contact", mail: "email",
  speed: "performance", slow: "performance", fast: "performance", optimize: "performance",
  optimise: "performance", lighthouse: "performance",
};

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s+.#-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.#-]+|[.#-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => SYNONYMS[t] ?? t);
}

/**
 * Anything scoring under this is treated as off-topic rather than answered
 * with the closest guess — a scoped bot confidently answering the wrong
 * question is worse than one that declines.
 *
 * The number can sit this low safely because a genuinely off-topic question
 * scores zero, not "a bit": none of its words appear in any entry. The gap
 * between nothing and one solid keyword hit is the whole discriminator.
 */
const THRESHOLD = 1.5;
const EXACT_HIT = 1.6;
const PREFIX_HIT = 0.8;
const PHRASE_HIT = 4;

export type Match = { answer: Answer; score: number } | null;

export function findAnswer(input: string): Match {
  const text = input.toLowerCase().trim();
  if (!text) return null;
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  let best: { answer: Answer; score: number } | null = null;

  for (const entry of KB) {
    let score = 0;

    // A whole phrase matching is the strongest signal available.
    for (const phrase of entry.phrases ?? []) {
      if (text.includes(phrase)) score += PHRASE_HIT;
    }

    const seen = new Set<string>();
    for (const token of tokens) {
      if (seen.has(token)) continue;
      seen.add(token);
      if (entry.keywords.includes(token)) score += EXACT_HIT;
      // Partial credit for near-misses like "pricing" against "price".
      else if (entry.keywords.some((k) => k.length > 4 && (k.startsWith(token) || token.startsWith(k)))) {
        score += PREFIX_HIT;
      }
    }

    // Damps long rambling questions without penalising short precise ones.
    // An earlier version divided by log2(len + 1), which made "templates" —
    // about as clear as a question gets — score lower than a vague sentence
    // that happened to contain more words.
    score = score / Math.max(1, Math.log2(Math.max(tokens.length, 1)) * 0.5);

    if (!best || score > best.score) best = { answer: entry, score };
  }

  return best && best.score >= THRESHOLD ? best : null;
}

/** Rotates the refusal so a run of off-topic questions does not repeat itself. */
export function offTopicReply(n: number) {
  return OFF_TOPIC[n % OFF_TOPIC.length];
}

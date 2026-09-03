"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The page background, per section: the repository this site was built from.
 *
 * Each section shows a different artifact of the work — a source file, the
 * commit graph, a build log, a diff, the dependency list, a shell session —
 * drifting past at two different speeds. That is the parallax: two layers per
 * section, the deep one barely moving and the near one moving faster than the
 * page, so the background has depth instead of being a flat texture that
 * scrolls along with everything else.
 *
 * Everything here moves by transform only. Framer Motion writes the transform
 * straight to the element outside React's render, so scrolling never
 * re-renders a component and never repaints a layer — the background this
 * replaces translated a full-viewport gradient every frame and cost half the
 * frame rate for it.
 */

type Kind = "k" | "s" | "n" | "c" | "f" | "p" | "d";
type Tok = [string, Kind];
type Line = Tok[];

/** Faint syntax colour. Keywords take the live accent, so the field recolours
 *  with the rest of the site when the accent is cycled. */
const KIND: Record<Kind, string> = {
  k: "text-accent",
  s: "text-accent-2",
  n: "text-accent-2",
  c: "text-ink-faint italic",
  f: "text-ink",
  p: "text-ink-dim",
  d: "text-ink-faint",
};

export type Motif = "file" | "graph" | "log" | "diff" | "deps" | "prompt";

/* --- The artifacts --------------------------------------------------------
   Real fragments of the work described elsewhere on the page: the 976
   generated city pages, the database-level feature gating, the asset budget.
   The background is the codebase, so it should say what the codebase says. */

const FILE: Line[] = [
  [["// lib/pages/generate.ts", "c"]],
  [["export ", "k"], ["async ", "k"], ["function ", "k"], ["generateCityPages", "f"], ["() {", "p"]],
  [["  const", "k"], [" cities = ", "p"], ["await", "k"], [" db.", "p"], ["from", "f"], ["(", "p"], ["\"cities\"", "s"], [").", "p"], ["select", "f"], ["()", "p"]],
  [["  return", "k"], [" cities.", "p"], ["map", "f"], ["((c) => ({", "p"]],
  [["    slug: ", "p"], ["slugify", "f"], ["(c.name),", "p"]],
  [["    forecast: ", "p"], ["await", "k"], [" cache.", "p"], ["resolve", "f"], ["(c.id),", "p"]],
  [["    revalidate: ", "p"], ["3600", "n"], [",", "p"]],
  [["  }))", "p"]],
  [["}", "p"]],
  [["", "p"]],
  [["// 976 pages, one build, no server", "c"]],
];

const LOG: Line[] = [
  [["$ ", "k"], ["next build", "f"]],
  [["  Next.js 16.3.3", "d"]],
  [["  ok  ", "n"], ["Compiled successfully", "p"]],
  [["  ok  ", "n"], ["Generating static pages ", "p"], ["(976/976)", "n"]],
  [["", "p"]],
  [["Route (app)                  Size", "d"]],
  [["  /                         ", "d"], ["4.1 kB", "n"]],
  [["  /city/[slug]              ", "d"], ["1.8 kB", "n"]],
  [["  /pricing                  ", "d"], ["2.2 kB", "n"]],
  [["", "p"]],
  [["  assets  ", "d"], ["28 MB", "s"], ["  ->  ", "d"], ["0.72 MB", "n"], ["   -97%", "p"]],
];

const DIFF: Line[] = [
  [["diff --git a/policies.sql", "d"]],
  [["@@ -14,7 +14,12 @@", "k"]],
  [["- if (user.plan === \"pro\") return true", "s"]],
  [["+ create policy \"tier_gate\" on projects", "n"]],
  [["+   for select using (", "n"]],
  [["+     tier_rank(auth.plan()) >= required_rank", "n"]],
  [["+   );", "n"]],
  [["", "p"]],
  [["# enforcement moved to the database, so a", "c"]],
  [["# direct API call cannot walk around it", "c"]],
];

const DEPS: Line[] = [
  [["{", "p"]],
  [["  ", "p"], ["\"dependencies\"", "f"], [": {", "p"]],
  [["    ", "p"], ["\"next\"", "s"], [": ", "p"], ["\"16.3.3\"", "n"], [",", "p"]],
  [["    ", "p"], ["\"react\"", "s"], [": ", "p"], ["\"19.2.0\"", "n"], [",", "p"]],
  [["    ", "p"], ["\"@supabase/supabase-js\"", "s"], [": ", "p"], ["\"2.x\"", "n"], [",", "p"]],
  [["    ", "p"], ["\"three\"", "s"], [": ", "p"], ["\"0.180\"", "n"], [",", "p"]],
  [["    ", "p"], ["\"stripe\"", "s"], [": ", "p"], ["\"18.x\"", "n"]],
  [["  }", "p"]],
  [["}", "p"]],
];

const PROMPT: Line[] = [
  [["~ ", "d"], ["usman@studio", "k"], [" $ ", "d"], ["git push origin main", "f"]],
  [["Enumerating objects: ", "d"], ["247", "n"], [", done.", "d"]],
  [["To github.com:usman/platform.git", "d"]],
  [["   ", "d"], ["a1f39c2..2313716", "n"], ["  main -> main", "p"]],
  [["", "p"]],
  [["~ ", "d"], ["usman@studio", "k"], [" $ ", "d"], ["mail ", "f"], ["hello@", "s"]],
];

const SOURCE: Record<Motif, Line[]> = {
  file: FILE,
  graph: FILE,
  log: LOG,
  diff: DIFF,
  deps: DEPS,
  prompt: PROMPT,
};

function CodeBlock({ lines }: { lines: Line[] }) {
  return (
    <pre className="font-mono text-[13.5px] leading-[2.15] sm:text-[16px]">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-5 whitespace-pre">
          <span className="w-6 shrink-0 select-none text-right text-ink-faint">{i + 1}</span>
          <span>
            {line.map(([text, kind], j) => (
              <span key={j} className={KIND[kind]}>
                {text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  );
}

/**
 * The commit graph: three lanes, one branch and one merge. Drawn rather than
 * listed, because the shape is the part that is recognisable at a glance and
 * at this opacity.
 */
function CommitGraph() {
  const nodes: Array<[number, number]> = [
    [40, 40],
    [40, 90],
    [110, 160],
    [110, 200],
    [180, 262],
    [110, 265],
    [180, 300],
    [110, 330],
    [40, 400],
    [40, 450],
  ];

  return (
    <svg viewBox="0 0 220 460" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M40 0 V460" stroke="currentColor" strokeWidth="2" />
      <path
        d="M40 90 C40 130, 110 120, 110 160 V330 C110 370, 40 360, 40 400"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M110 200 C110 235, 180 228, 180 262 V300" stroke="currentColor" strokeWidth="2" />
      {nodes.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="7"
          fill="var(--surface, var(--bg))"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      ))}
    </svg>
  );
}

const COMMITS: Array<[string, string]> = [
  ["2313716", "Colour-block the sections"],
  ["82efddb", "Grain, banding, iridescence"],
  ["5a37a64", "Glass surfaces, section markers"],
  ["ff1e293", "LLM backend for the assistant"],
  ["a856233", "Scoped site assistant"],
];

/**
 * The same idea for pages that are not colour-blocked into sections — Tools,
 * Services, Templates. There is no section to measure, so this one runs off
 * the window's own scroll and lives inside the fixed backdrop.
 */
export function CodeWall() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const deep = useTransform(scrollY, [0, 3000], [0, -140]);
  const near = useTransform(scrollY, [0, 3000], [0, -520]);

  return (
    <div className="code-field" aria-hidden="true">
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className="absolute left-[4%] top-[8%] hidden h-[70vh] w-40 text-ink sm:block"
      >
        <CommitGraph />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y: near }}
        className="code-field-fade absolute right-[-6%] top-[10%] lg:right-[-1%]"
      >
        <CodeBlock lines={FILE} />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className="code-field-fade absolute bottom-[-30%] left-[6%] hidden lg:block"
      >
        <CodeBlock lines={LOG} />
      </motion.div>
    </div>
  );
}

export function CodeField({
  motif,
  align = "right",
  tall = false,
}: {
  motif: Motif;
  align?: "left" | "right";
  /** For sections taller than the viewport — Impact is 220vh with a sticky
   *  panel — so the field stays in frame instead of scrolling off the top
   *  while the section is still on screen. */
  tall?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Progress across this section's own travel through the viewport, so each
  // section runs its own parallax rather than sharing one page-wide offset.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const deep = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const near = useTransform(scrollYProgress, [0, 1], [190, -190]);

  const codeSide = align === "right" ? "right-[-6%] lg:right-[-1%]" : "left-[-6%] lg:left-[-1%]";
  const graphSide = align === "right" ? "left-[4%]" : "right-[4%]";

  return (
    <div ref={ref} className="code-field" aria-hidden="true">
      <div className={tall ? "sticky top-0 h-screen" : "absolute inset-0"}>
      {/* Deep layer: the commit graph, barely moving. Being the slowest thing
          in the section is what places it furthest back. */}
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className={`absolute top-[6%] hidden h-[68%] w-32 text-ink sm:block sm:w-44 ${graphSide}`}
      >
        <CommitGraph />
      </motion.div>

      {/* Near layer: the source. Travels furthest, so it reads as the closest
          thing behind the content. */}
      <motion.div
        style={reduced ? undefined : { y: near }}
        className={`code-field-fade absolute top-[4%] ${codeSide}`}
      >
        <CodeBlock lines={SOURCE[motif]} />
      </motion.div>

      {/* The commit list only appears where the graph is the point, and only
          where there is real margin to put it in. */}
      {motif === "graph" && (
        <motion.div
          style={reduced ? undefined : { y: deep }}
          className={`absolute bottom-[8%] hidden font-mono text-[12px] leading-[2.4] xl:block ${graphSide}`}
        >
          {COMMITS.map(([hash, message]) => (
            <div key={hash} className="whitespace-pre">
              <span className="text-accent">{hash}</span>
              <span className="text-ink-dim">{"  " + message}</span>
            </div>
          ))}
        </motion.div>
      )}
      </div>
    </div>
  );
}

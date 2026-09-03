"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * The page background, per section: the repository this site was built from.
 *
 * Each section shows a different artifact of the work — an editor holding the
 * page generator, the commit graph, the build log, a policy diff, the
 * dependency list, a shell session — on two layers moving at different speeds.
 * That difference is the parallax: the graph barely moves, the editor moves
 * three times as far, so the background has depth rather than scrolling along
 * with the page. The graph also draws itself as the section passes, which is
 * the part that makes it read as a thing happening rather than a texture.
 *
 * The layers move by transform only, and Framer Motion writes those straight
 * to the element outside React's render, so scrolling never re-renders a
 * component and never repaints a layer.
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
  [["   ", "d"], ["a1f39c2..0c9466d", "n"], ["  main -> main", "p"]],
  [["", "p"]],
  [["~ ", "d"], ["usman@studio", "k"], [" $ ", "d"], ["mail ", "f"], ["hello@", "s"]],
];

const META: Record<Motif, { name: string; lines: Line[] }> = {
  file: { name: "generate.ts", lines: FILE },
  graph: { name: "log --graph", lines: FILE },
  log: { name: "build.log", lines: LOG },
  diff: { name: "policies.sql", lines: DIFF },
  deps: { name: "package.json", lines: DEPS },
  prompt: { name: "zsh", lines: PROMPT },
};

/**
 * The editor the code sits in. Bare text floating on the surface read as a
 * watermark; the window chrome, the gutter rule and the caret are what make it
 * read as an editor at a glance, which is the whole point of the motif.
 */
function EditorPanel({ motif }: { motif: Motif }) {
  const { name, lines } = META[motif];
  const last = lines.length - 1;

  return (
    <div className="w-[34rem] max-w-[94vw] rounded-xl border border-ink-faint lg:w-[40rem]">
      <div className="flex items-center gap-2 border-b border-ink-faint px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full border border-ink-faint" />
        <span className="h-2.5 w-2.5 rounded-full border border-ink-faint" />
        <span className="h-2.5 w-2.5 rounded-full border border-ink-faint" />
        <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-dim">
          {name}
        </span>
      </div>

      <pre className="overflow-hidden px-4 py-4 font-mono text-[13.5px] leading-[2.1] sm:text-[15px] lg:text-[16px]">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 whitespace-pre">
            <span className="w-5 shrink-0 select-none border-r border-ink-faint pr-3 text-right text-ink-faint">
              {i + 1}
            </span>
            <span>
              {line.map(([text, kind], j) => (
                <span key={j} className={KIND[kind]}>
                  {text}
                </span>
              ))}
              {i === last && <span className="code-caret" />}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}

const NODES: Array<[number, number]> = [
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

/** One commit. Its own component so each can hold a hook without putting a
 *  hook inside a loop. */
function CommitNode({
  cx,
  cy,
  at,
  progress,
}: {
  cx: number;
  cy: number;
  at: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [at - 0.04, at], [0, 1]);
  const r = useTransform(progress, [at - 0.04, at], [2, 7]);

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      style={{ opacity }}
      fill="var(--surface, var(--bg))"
      stroke="currentColor"
      strokeWidth="2.5"
    />
  );
}

/**
 * The commit graph: three lanes, one branch and one merge, drawing itself as
 * the section goes by. The shape is what is recognisable at this opacity — far
 * more than a list of hashes would be.
 */
function CommitGraph({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean | null;
}) {
  const draw = useTransform(progress, [0.02, 0.55], [0, 1]);
  const paths = [
    "M40 0 V460",
    "M40 90 C40 130, 110 120, 110 160 V330 C110 370, 40 360, 40 400",
    "M110 200 C110 235, 180 228, 180 262 V300",
  ];

  return (
    <svg viewBox="0 0 220 460" className="h-full w-full" fill="none" aria-hidden="true">
      {paths.map((d) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="2"
          style={reduced ? undefined : { pathLength: draw }}
        />
      ))}
      {NODES.map(([cx, cy], i) =>
        reduced ? (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="7"
            fill="var(--surface, var(--bg))"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        ) : (
          <CommitNode
            key={i}
            cx={cx}
            cy={cy}
            // Spread across the same window the lines draw in, so nodes land
            // just behind the line reaching them.
            at={0.06 + (i / NODES.length) * 0.5}
            progress={progress}
          />
        )
      )}
    </svg>
  );
}

const COMMITS: Array<[string, string]> = [
  ["0c9466d", "Background: the repository, in parallax"],
  ["2313716", "Colour-block the sections"],
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
  const { scrollY, scrollYProgress } = useScroll();
  const deep = useTransform(scrollY, [0, 3000], [0, -140]);
  const near = useTransform(scrollY, [0, 3000], [0, -520]);

  return (
    <div className="code-field" aria-hidden="true">
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className="absolute left-[4%] top-[8%] hidden h-[70vh] w-40 text-ink sm:block"
      >
        <CommitGraph progress={scrollYProgress} reduced={reduced} />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y: near }}
        className="absolute right-[-8%] top-[12%] lg:right-[-2%]"
      >
        <EditorPanel motif="file" />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className="absolute bottom-[-24%] left-[6%] hidden lg:block"
      >
        <EditorPanel motif="log" />
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
  /** For sections taller than the viewport — Impact is 220vh — where a single
   *  block near the top would be scrolled past while the section is still on
   *  screen. Stretches the graph and adds a second editor further down. */
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

  const codeSide = align === "right" ? "right-[-8%] lg:right-[-2%]" : "left-[-8%] lg:left-[-2%]";
  const graphSide = align === "right" ? "left-[4%]" : "right-[4%]";

  return (
    <div ref={ref} className="code-field" aria-hidden="true">
      {/* Deep layer: the commit graph, barely moving. Being the slowest thing
          in the section is what places it furthest back. */}
      <motion.div
        style={reduced ? undefined : { y: deep }}
        className={`absolute hidden w-32 text-ink sm:block sm:w-44 ${graphSide} ${
          tall ? "top-[6%] h-[86%]" : "top-[6%] h-[68%]"
        }`}
      >
        <CommitGraph progress={scrollYProgress} reduced={reduced} />
      </motion.div>

      {/* Near layer: the editor. Travels furthest, so it reads as the closest
          thing behind the content. */}
      <motion.div
        style={reduced ? undefined : { y: near }}
        className={`absolute top-[5%] ${codeSide}`}
      >
        <EditorPanel motif={motif} />
      </motion.div>

      {/* A tall section needs a second one further down, or the field is off
          the top of the screen for most of the time the section is in view. */}
      {tall && (
        <motion.div
          style={reduced ? undefined : { y: deep }}
          className={`absolute top-[58%] hidden lg:block ${
            align === "right" ? "left-[-2%]" : "right-[-2%]"
          }`}
        >
          <EditorPanel motif="deps" />
        </motion.div>
      )}

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
  );
}

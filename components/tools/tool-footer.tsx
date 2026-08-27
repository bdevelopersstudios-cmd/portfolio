import Link from "next/link";
import { TOOLS, type Tool } from "@/lib/tools";

/**
 * Sits at the bottom of every tool page.
 *
 * Two jobs. Related tools keep someone who arrived from a search on the site
 * rather than bouncing after one conversion. And the pitch is written per
 * group, because "need this in your product?" means something specific to
 * someone who just ran OCR on a stack of invoices, and nothing at all as a
 * generic line.
 */

const PITCH: Record<Tool["group"], { head: string; body: string }> = {
  Images: {
    head: "Running this on every upload instead of by hand?",
    body: "Resizing, format conversion and compression at upload time is a normal part of the products I build — it keeps storage bills and mobile load times down without anyone thinking about it.",
  },
  PDF: {
    head: "Need PDFs generated or processed inside your product?",
    body: "Invoices, statements, contracts and exports — generated on demand, merged, stamped and stored. I have built this into billing systems where the document is the deliverable.",
  },
  Design: {
    head: "Setting up a brand or a design system?",
    body: "I take Figma files through to production code, including the asset pipeline — icons, tokens and the components that use them.",
  },
  Extract: {
    head: "Have a pile of documents to get data out of?",
    body: "OCR and document intake pipelines are on my CV: I have worked OCR plugin integrations into client projects and built the ingestion around them.",
  },
};

export function ToolFooter({ tool }: { tool: Tool }) {
  const pitch = PITCH[tool.group];
  // Same group first, then anything else, so the suggestions stay relevant
  // without ever showing an empty row.
  const related = [
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.group === tool.group),
    ...TOOLS.filter((t) => t.slug !== tool.slug && t.group !== tool.group),
  ].slice(0, 4);

  return (
    <>
      <section className="mt-20 border-t border-line-soft pt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          Other tools
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {related.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              data-cursor-hover
              className="group rounded-xl border border-line bg-bg-raised px-5 py-4 transition-colors hover:border-accent"
            >
              <span className="block font-display text-[17px] transition-colors group-hover:text-accent">
                {t.name}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-ink-dim">{t.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-bg-raised p-7 sm:p-9">
        <h2 className="max-w-lg font-display text-2xl leading-[1.15]">{pitch.head}</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-dim">{pitch.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/services"
            data-cursor-hover
            className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-ink transition-opacity hover:opacity-90"
          >
            See what I build
          </Link>
          <Link
            href="/#work"
            data-cursor-hover
            className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim transition-colors hover:border-accent hover:text-accent"
          >
            Selected work
          </Link>
        </div>
      </section>
    </>
  );
}

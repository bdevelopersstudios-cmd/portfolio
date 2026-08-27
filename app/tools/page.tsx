import type { Metadata } from "next";
import Link from "next/link";
import { ToolGrid } from "@/components/tools/tool-grid";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free file tools — Mohammad Usman Saud",
  description:
    "Convert images, split and merge PDFs, extract text and run OCR — entirely in your browser. Nothing is uploaded.",
};

const GROUPS = ["Images", "PDF", "Design", "Extract"] as const;

export default function ToolsPage() {
  return (
    <main>
      <section className="border-b border-line-soft pb-16 pt-36 sm:pt-40">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="text-ink-faint">Free</span>
            <span className="h-px w-8 bg-line" />
            <span>Tools</span>
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
            File tools that never upload your files.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-dim text-balance">
            Every one of these runs inside your browser tab. Your document is
            never sent to a server, because there is no server — which also
            means no queue, no size cap, and no account.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          {GROUPS.map((group) => (
            <div key={group} className="mb-14 last:mb-0">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">{group}</h2>
              <ToolGrid tools={TOOLS.filter((t) => t.group === group)} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line-soft py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl">Need this inside your own product?</h2>
            <p className="mt-4 text-ink-dim">
              These are the same techniques I build into client work — document
              pipelines, OCR intake, image processing at upload. If you need it
              wired into an app rather than run by hand, get in touch.
            </p>
            <Link
              href="/#contact"
              data-cursor-hover
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-ink"
            >
              Talk about a build
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

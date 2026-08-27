import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, toolBySlug } from "@/lib/tools";
import { ToolRunner } from "@/components/tools/tool-runner";
import { ToolFooter } from "@/components/tools/tool-footer";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) return { title: "Tool" };
  return {
    title: `${tool.name} — free, in your browser`,
    description: tool.blurb,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();

  return (
    <main>
      <section className="pb-8 pt-36 sm:pt-40">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <Link href="/tools" data-cursor-hover className="font-mono text-xs uppercase tracking-[0.2em] text-ink-dim">
            ← All tools
          </Link>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl">{tool.name}</h1>
          <p className="mt-4 text-lg text-ink-dim text-balance">{tool.blurb}</p>
          {tool.caveat && (
            <p className="mt-5 rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm text-ink-dim">
              {tool.caveat}
            </p>
          )}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <ToolRunner slug={tool.slug} />
          <ToolFooter tool={tool} />
        </div>
      </section>
    </main>
  );
}

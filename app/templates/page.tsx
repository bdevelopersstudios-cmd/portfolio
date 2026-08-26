import type { Metadata } from "next";
import { templates } from "@/lib/templates";
import { TemplateCard } from "@/components/templates/template-card";

export const metadata: Metadata = {
  title: "Templates — Mohammad Usman Saud",
  description: "Ready-made Bubble.io, Next.js, and Figma templates for shipping faster.",
};

export default function TemplatesPage() {
  return (
    <main>
      <section className="border-b border-line-soft pb-20 pt-36 sm:pt-40">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="text-ink-faint">Store</span>
            <span className="h-px w-8 bg-line" />
            <span>Templates</span>
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
            Ready-made foundations, so the boring part is already done.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-dim text-balance">
            Bubble.io, Next.js, and Figma templates built from the same patterns used in client
            work — auth, billing, dashboards, and design systems, ready to reskin.
          </p>
          <p className="mt-4 max-w-xl text-sm text-ink-faint text-balance">
            These are launching soon and aren&apos;t available for purchase yet.{" "}
            <a href={`mailto:mohammadusmansaud@gmail.com?subject=Template%20early%20access`} className="underline hover:text-accent">
              Get in touch
            </a>{" "}
            if you&apos;d like to know when they go live.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, i) => (
              <TemplateCard key={template.slug} template={template} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

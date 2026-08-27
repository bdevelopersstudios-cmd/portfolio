import type { Metadata } from "next";
import { templates, commonIncludes } from "@/lib/templates";
import { TemplateCard } from "@/components/templates/template-card";

export const metadata: Metadata = {
  title: "Templates — Mohammad Usman Saud",
  description:
    "Production-ready Next.js templates: a bento SaaS landing page, an analytics dashboard, and an editorial studio site. Every one has a live preview.",
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
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
            Three templates. Every one of them running, not pictured.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-dim text-balance">
            Each is a complete front end you can open right now and use — sort the
            table, drag the seat slider, filter the index. What you see in the
            preview is what lands in the repository.
          </p>
          <p className="mt-4 max-w-xl text-sm text-ink-faint text-balance">
            Checkout isn&apos;t connected yet, so purchases run through me directly
            for the moment.{" "}
            <a
              href="mailto:mohammadusmansaud@gmail.com?subject=Template%20purchase"
              className="underline hover:text-accent"
            >
              Get in touch
            </a>{" "}
            and I&apos;ll send the repository access.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template, i) => (
              <TemplateCard key={template.slug} template={template} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line-soft py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
                <span>What&apos;s in the price</span>
              </div>
              <h2 className="mt-5 max-w-md font-display text-3xl leading-[1.1] text-balance">
                A thousand dollars buys the week you would have spent building it.
              </h2>
              <p className="mt-5 max-w-md text-ink-dim">
                These aren&apos;t theme files. Each one is the front end I would
                hand a client at the end of a discovery sprint — the layout
                decisions made, the responsive work done, the interaction states
                written, and the whole thing commented so the next person can
                change it without archaeology.
              </p>
            </div>

            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {commonIncludes.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-line-soft py-3 text-sm text-ink-dim">
                  <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-3 border-b border-line-soft py-3 text-sm text-ink-dim">
                <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                A working session to get it deployed on your stack
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import {
  ProcessList,
  ServiceFaq,
  ServiceList,
  ServicesCta,
} from "@/components/services/service-list";

export const metadata: Metadata = {
  title: "Services — Mohammad Usman Saud",
  description:
    "MVP sprints, Bubble-to-Next.js migrations, performance rescues and ongoing development. Fixed-price phases, written scope before anything is built.",
};

export default function ServicesPage() {
  return (
    <main>
      <section className="border-b border-line-soft pb-16 pt-36 sm:pt-40">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="text-ink-faint">Work with me</span>
            <span className="h-px w-8 bg-line" />
            <span>Services</span>
          </div>

          {/* The positioning, stated once and plainly: the overlap between
              no-code and real code is the rare thing here, not "full-stack". */}
          <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
            I build it fast in no-code, then rebuild it properly when you outgrow that.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-dim text-balance">
            Most developers do one or the other. I hold a Bubble.io certification
            and two years of production no-code behind it, and I now ship React,
            Next.js, Supabase and Stripe — so I can get you to market in weeks and
            still be the person who moves you onto a real codebase later.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-7 sm:max-w-2xl">
            {[
              ["Fixed price", "per scoped phase"],
              ["Written scope", "before any work starts"],
              ["You own it", "source, accounts, rights"],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="font-display text-lg leading-none">{t}</dt>
                <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  {d}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <ServiceList />
        </div>
      </section>

      <section className="border-t border-line-soft py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <h2 className="font-display text-3xl sm:text-4xl">How an engagement runs</h2>
          <p className="mt-3 max-w-xl text-ink-dim">
            The same four steps every time, so you always know where a project is.
          </p>
          <ProcessList />
        </div>
      </section>

      <section className="border-t border-line-soft py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <h2 className="font-display text-3xl sm:text-4xl">Questions</h2>
          <ServiceFaq />
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <ServicesCta />
        </div>
      </section>
    </main>
  );
}

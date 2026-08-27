"use client";

import Link from "next/link";

/**
 * The only piece of the portfolio that appears inside a preview: a thin strip
 * confirming what the visitor is looking at and how to get back. Deliberately
 * fixed to the bottom so it never sits over the template's own navigation.
 */
export function PreviewBar({ name, price }: { name: string; price: number }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#0b0d12]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
          Live preview &middot; <span className="text-white">{name}</span> &middot; ${price}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="rounded-full border border-white/20 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-white/50 hover:text-white"
          >
            All templates
          </Link>
          <a
            href={`mailto:mohammadusmansaud@gmail.com?subject=${encodeURIComponent(`${name} template`)}`}
            className="rounded-full bg-white px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0b0d12] transition-opacity hover:opacity-90"
          >
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}

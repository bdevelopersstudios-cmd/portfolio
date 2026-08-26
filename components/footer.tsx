import { profile } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-line-soft py-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint sm:flex-row sm:px-10 lg:px-16">
        <span>&copy; {new Date().getFullYear()} {profile.name}</span>
        <span>Built with Next.js &amp; React Three Fiber</span>
      </div>
    </footer>
  );
}

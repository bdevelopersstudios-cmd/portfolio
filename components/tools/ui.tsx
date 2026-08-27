"use client";

import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * Shared feedback pieces for the tools.
 *
 * The progress values these show arrive in jumps — one file finishes, one PDF
 * page renders — so the bar is driven through a spring rather than bound to
 * the raw number. Otherwise it snaps between positions and reads as broken on
 * a two-file job.
 */

export function ProgressBar({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail?: string;
}) {
  const reduced = useReducedMotion();
  const spring = useSpring(0, { stiffness: 90, damping: 20, mass: 0.4 });
  const width = useTransform(spring, (v) => `${Math.max(2, Math.min(100, v * 100))}%`);
  const percent = useTransform(spring, (v) => `${Math.round(Math.min(1, v) * 100)}%`);

  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, spring, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mt-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-4 text-xs">
        <span className="flex items-center gap-2 text-ink-dim">
          <Spinner />
          {label}
        </span>
        <motion.span className="font-mono tabular-nums text-ink-faint">{percent}</motion.span>
      </div>

      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-accent" style={{ width }}>
          {/* A sheen travelling along the filled portion — the signal that
              work is still happening even while the number holds still
              between steps. */}
          {!reduced && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ["-4rem", "100%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>

      {detail && <p className="mt-1.5 font-mono text-[11px] text-ink-faint">{detail}</p>}
    </motion.div>
  );
}

export function Spinner({ size = 12 }: { size?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full border-2 border-accent border-t-transparent"
      style={{ width: size, height: size }}
      animate={reduced ? undefined : { rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Draws itself on when a job finishes — a beat of confirmation, then gone. */
export function SuccessCheck({ label }: { label: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-6 flex items-center gap-2.5 text-sm text-ink-dim"
      role="status"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden="true">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--accent)"
          strokeWidth="2"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? undefined : { pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <motion.path
          d="M7.5 12.4l3 3 6-6.4"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={reduced ? undefined : { pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
        />
      </svg>
      {label}
    </motion.div>
  );
}

/** Wraps a result list so rows arrive in sequence rather than all at once. */
export function Stagger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      animate={reduced ? undefined : "shown"}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.045 } } }}
    >
      {children}
    </motion.div>
  );
}

export const stagStep = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Progress + success share one slot, so one replaces the other cleanly. */
export function StatusArea({
  busy,
  value,
  label,
  detail,
  done,
  doneLabel,
}: {
  busy: boolean;
  value: number;
  label: string;
  detail?: string;
  done: boolean;
  doneLabel: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {busy ? (
        <ProgressBar key="progress" value={value} label={label} detail={detail} />
      ) : done ? (
        <SuccessCheck key="done" label={doneLabel} />
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * The page's background below the hero.
 *
 * It is the same mesh-gradient language the hero is built from — big soft
 * radial washes keyed to the accent — rather than objects floating behind the
 * copy. Scrolling moves each wash at its own rate, which is where the
 * parallax comes from: by the bottom of the page the fastest has travelled
 * roughly five times as far as the slowest, so they visibly separate.
 *
 * Deliberately CSS and not WebGL. The gradients paint once and only
 * `transform` changes, which keeps this on the compositor, and it means the
 * page carries one WebGL context (the hero's) rather than two.
 */

type Layer = {
  className: string;
  /** Vertical travel across the whole page, in vh. Higher reads as nearer. */
  travel: number;
  /** Horizontal sway across the page, in vw. */
  sway: number;
  /** Scale at the top of the page and at the bottom. */
  scaleFrom: number;
  scaleTo: number;
};

const LAYERS: Layer[] = [
  { className: "aurora-a", travel: -22, sway: -6, scaleFrom: 1, scaleTo: 1.18 },
  { className: "aurora-b", travel: -48, sway: 9, scaleFrom: 1.1, scaleTo: 0.9 },
  { className: "aurora-c", travel: -84, sway: -12, scaleFrom: 0.95, scaleTo: 1.25 },
  { className: "aurora-d", travel: -112, sway: 7, scaleFrom: 1.15, scaleTo: 0.88 },
];

export function AuroraBackground() {
  const root = useRef<HTMLDivElement>(null);
  const blobs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const el = root.current;
      if (!el) return;

      const doc = document.documentElement;
      const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

      // The hero paints its own opaque background over this, so there is
      // nothing to show until the page has scrolled clear of it.
      const hero = document.getElementById("top");
      const lit = !hero || window.scrollY > window.innerHeight * 0.5;
      el.dataset.lit = String(lit);
      if (!lit) return;

      const vh = window.innerHeight / 100;
      const vw = window.innerWidth / 100;

      LAYERS.forEach((layer, i) => {
        const node = blobs.current[i];
        if (!node) return;
        const y = progress * layer.travel * vh;
        // A single sine over the page, so each wash arcs rather than sliding
        // in a straight line — the drift is what stops it reading mechanical.
        const x = reduced ? 0 : Math.sin(progress * Math.PI * 1.4 + i) * layer.sway * vw;
        const scale = layer.scaleFrom + (layer.scaleTo - layer.scaleFrom) * progress;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      });

    };

    const onScroll = () => {
      // One write per frame at most; scroll fires far more often than that,
      // and Lenis fires on every frame of its easing.
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={root} className="aurora" aria-hidden="true">
      {/* Static: see the note in globals.css on why it no longer rotates. */}
      <div className="aurora-shimmer" />
      <div className="aurora-sweep" />
      {LAYERS.map((layer, i) => (
        <span
          key={layer.className}
          ref={(el) => {
            blobs.current[i] = el;
          }}
          className={`aurora-blob ${layer.className}`}
        />
      ))}
      <div className="aurora-veil" />
      {/* Grain sits last so it textures everything beneath it. */}
      <div className="aurora-grain" />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { CodeWall } from "@/components/code-field";

/**
 * The backdrop for pages that are not colour-blocked into sections — Tools,
 * Services, Templates. It carries the same parallax code field the home page
 * runs per section, plus a light that follows you.
 *
 * Everything in here moves by transform alone, which is the lesson from an
 * earlier background: translating a full-viewport gradient on scroll repaints
 * it every frame and halved the frame rate. Elements that only ever transform
 * cost effectively nothing.
 *
 * The light tracks the pointer on desktop and the scroll position everywhere,
 * so it is never dead on a phone where there is no cursor.
 */
export function Backdrop() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Target and current are kept apart so the light eases toward the pointer
    // rather than snapping — a light that teleports reads as a bug.
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.4;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let running = false;

    const place = () => {
      if (glow.current) {
        glow.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * 0.08;
      y += dy * 0.08;
      place();

      // Stops the loop once it has settled, rather than running forever.
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        running = false;
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced) {
        x = targetX;
        y = targetY;
        place();
        return;
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointer = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      start();
    };

    // On touch there is no cursor, so the light drifts with the scroll instead
    // — otherwise the effect would simply never appear on a phone.
    const onScroll = () => {
      if (!coarse) return;
      const doc = document.documentElement;
      const progress = window.scrollY / Math.max(doc.scrollHeight - window.innerHeight, 1);
      targetX = window.innerWidth * (0.3 + 0.4 * Math.sin(progress * Math.PI * 2));
      targetY = window.innerHeight * (0.25 + 0.5 * ((progress * 3) % 1));
      start();
    };

    place();
    if (!coarse) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={root} className="backdrop" aria-hidden="true">
      <CodeWall />
      <div ref={glow} className="backdrop-glow" />
    </div>
  );
}

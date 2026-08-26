"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}

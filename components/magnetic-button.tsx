"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "motion/react";

export function MagneticButton({
  children,
  href,
  variant = "solid",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline";
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    setOffset({ x: relX * 0.3, y: relY * 0.3 });
  };

  // pointer-events-auto so the button still works inside a pointer-events-none
  // container (the hero overlays one over the 3D canvas); a no-op elsewhere.
  const base =
    "pointer-events-auto relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-300";
  const styles =
    variant === "solid"
      ? "bg-accent text-accent-ink hover:bg-accent-dim"
      : // A touch stronger than --line, which disappears against the hero's
        // gradient wash where this button also has to read.
        "border border-ink/20 text-ink hover:border-accent hover:text-accent";

  return (
    <motion.a
      ref={ref}
      href={href}
      data-cursor-hover
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.2 }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.a>
  );
}

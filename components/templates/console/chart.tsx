"use client";

import { useId, useMemo, useState } from "react";
import { chartPaths } from "./data";
import { useConsole } from "./shell";

/**
 * An area chart in raw SVG. A charting library is the dependency most likely
 * to break on a major bump and the hardest to bend to a brand; the path maths
 * is about forty lines and is yours to edit.
 */
export function AreaChart({
  values,
  label,
  format = (v: number) => v.toLocaleString(),
  color,
  height = 220,
}: {
  values: number[];
  label: string;
  format?: (v: number) => string;
  color?: string;
  height?: number;
}) {
  const { c } = useConsole();
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = height;
  const stroke = color ?? c.accent;
  // useId, not a random string: two charts on one page must not collide on
  // their gradient id, and the value has to survive a re-render.
  const id = `fill-${useId().replace(/:/g, "")}`;
  const { line, area, points } = useMemo(() => chartPaths(values, W, H), [values, H]);

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold">{label}</h2>
        <span className="font-mono text-[12px]" style={{ color: c.inkFaint }}>
          {hover === null ? "hover the chart" : `${format(values[hover])} @ ${hover}:00`}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        style={{ height: "auto" }}
        role="img"
        aria-label={`${label} over the last ${values.length} hours`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.34" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke={c.edge} strokeWidth="1" />
        ))}

        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />

        {hover !== null && (
          <g>
            <line
              x1={points[hover][0]}
              x2={points[hover][0]}
              y1="0"
              y2={H}
              stroke={stroke}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={points[hover][0]} cy={points[hover][1]} r="4.5" fill={stroke} />
          </g>
        )}

        {/* Invisible hit strips, one per sample, so the readout tracks the
            pointer without a library's event layer. */}
        {points.map(([x], i) => (
          <rect
            key={i}
            x={x - W / values.length / 2}
            y="0"
            width={W / values.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
    </>
  );
}

/** A compact bar chart, for the billing usage breakdown. */
export function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const { c } = useConsole();
  const max = Math.max(...values);
  return (
    <div className="flex h-40 gap-2">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col">
          {/* The bar's percentage height needs a parent with a resolved
              height to measure against — `flex-1` gives it one. Sitting
              directly in an auto-height column it computes to zero. */}
          <div className="flex flex-1 items-end">
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${(v / max) * 100}%`,
                background: i === values.length - 1 ? c.accent : `${c.accent}55`,
              }}
              title={`${labels[i]}: ${v.toLocaleString()}`}
            />
          </div>
          <span className="mt-2 text-center text-[10.5px]" style={{ color: c.inkFaint }}>
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

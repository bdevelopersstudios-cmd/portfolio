const NODES: [number, number][] = [
  [80, 300],
  [200, 380],
  [140, 480],
  [320, 200],
  [1150, 150],
  [1250, 280],
  [1100, 390],
  [1300, 510],
];

const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [4, 5],
  [5, 6],
  [5, 7],
];

const ISO_HEX = "16,0 8,13.9 -8,13.9 -16,0 -8,-13.9 8,-13.9";
const ISO_LINES = "M16,0 L-8,13.9 M-8,13.9 L-8,-13.9 M-8,-13.9 L16,0";

function IsoCube({ x, y, scale = 1, color }: { x: number; y: number; scale?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={color} strokeWidth={1.2} fill="none">
      <polygon points={ISO_HEX} />
      <path d={ISO_LINES} />
    </g>
  );
}

export function VectorBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="vb-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>

      <circle cx={150} cy={140} r={200} fill="var(--accent)" opacity={0.1} filter="url(#vb-blur)" />
      <circle cx={1300} cy={640} r={230} fill="var(--accent-2)" opacity={0.1} filter="url(#vb-blur)" />

      {LINES.map(([a, b], i) => {
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--line)"
            strokeWidth={1}
          />
        );
      })}

      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 4 : 2.5}
          fill={i % 3 === 0 ? "var(--accent)" : "var(--ink-faint)"}
          opacity={i % 3 === 0 ? 0.5 : 0.4}
        />
      ))}

      <IsoCube x={320} y={200} scale={1.3} color="var(--accent)" />
      <IsoCube x={80} y={300} scale={0.9} color="var(--ink-faint)" />
      <IsoCube x={1100} y={390} scale={1.2} color="var(--accent-2)" />
    </svg>
  );
}

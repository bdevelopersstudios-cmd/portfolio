const RINGS_RIGHT = [90, 160, 230, 300];
const RINGS_LEFT = [70, 140];

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
          <feGaussianBlur stdDeviation="70" />
        </filter>
      </defs>

      <circle cx={150} cy={140} r={210} fill="var(--accent)" opacity={0.09} filter="url(#vb-blur)" />
      <circle cx={1280} cy={620} r={240} fill="var(--accent-2)" opacity={0.09} filter="url(#vb-blur)" />

      <g stroke="var(--line)" strokeWidth={1} fill="none">
        {RINGS_RIGHT.map((r) => (
          <circle key={r} cx={1080} cy={410} r={r} />
        ))}
        {RINGS_LEFT.map((r) => (
          <circle key={r} cx={130} cy={260} r={r} />
        ))}
      </g>

      <circle cx={1080} cy={410} r={4} fill="var(--accent)" opacity={0.6} />
      <circle cx={130} cy={260} r={3} fill="var(--accent-2)" opacity={0.5} />
    </svg>
  );
}

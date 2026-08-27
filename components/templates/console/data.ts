/** Mock data for the Console template. One file, so a buyer swaps it for a real API in one place. */

export const SERIES = [
  1840, 2120, 1990, 2460, 2310, 2780, 3120, 2940, 3380, 3610, 3420, 3980, 4220, 4050, 4610, 4880,
  4720, 5240, 5510, 5380, 5920, 6180, 6040, 6620,
];

export const LATENCY = [
  186, 192, 201, 188, 214, 232, 226, 241, 218, 205, 233, 268, 254, 240, 262, 289, 271, 258, 244,
  231, 248, 266, 252, 218,
];

export type Row = {
  id: string;
  endpoint: string;
  calls: number;
  p95: number;
  errors: number;
  status: "healthy" | "degraded" | "down";
  region: string;
};

export const ROWS: Row[] = [
  { id: "r1", endpoint: "POST /v1/events", calls: 184230, p95: 218, errors: 0.42, status: "healthy", region: "iad1" },
  { id: "r2", endpoint: "GET /v1/projects", calls: 92410, p95: 96, errors: 0.08, status: "healthy", region: "fra1" },
  { id: "r3", endpoint: "POST /v1/ingest", calls: 76180, p95: 612, errors: 2.71, status: "degraded", region: "iad1" },
  { id: "r4", endpoint: "GET /v1/usage", calls: 41060, p95: 141, errors: 0.19, status: "healthy", region: "sin1" },
  { id: "r5", endpoint: "POST /v1/webhooks", calls: 28840, p95: 1840, errors: 9.4, status: "down", region: "fra1" },
  { id: "r6", endpoint: "GET /v1/members", calls: 19220, p95: 88, errors: 0.02, status: "healthy", region: "iad1" },
  { id: "r7", endpoint: "PATCH /v1/billing", calls: 8140, p95: 324, errors: 1.12, status: "degraded", region: "sin1" },
  { id: "r8", endpoint: "DELETE /v1/keys", calls: 3120, p95: 74, errors: 0, status: "healthy", region: "fra1" },
];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Viewer";
  status: "active" | "invited";
  seen: string;
};

export const MEMBERS: Member[] = [
  { id: "m1", name: "Mara Silva", email: "mara@fieldnote.io", role: "Owner", status: "active", seen: "2 minutes ago" },
  { id: "m2", name: "Dan Okafor", email: "dan@fieldnote.io", role: "Admin", status: "active", seen: "1 hour ago" },
  { id: "m3", name: "Priya Raman", email: "priya@fieldnote.io", role: "Developer", status: "active", seen: "Yesterday" },
  { id: "m4", name: "Tom Byrne", email: "tom@fieldnote.io", role: "Developer", status: "active", seen: "3 days ago" },
  { id: "m5", name: "Lena Fischer", email: "lena@fieldnote.io", role: "Viewer", status: "invited", seen: "—" },
  { id: "m6", name: "Idris Khan", email: "idris@fieldnote.io", role: "Developer", status: "invited", seen: "—" },
];

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "open" | "failed";
  seats: number;
};

export const INVOICES: Invoice[] = [
  { id: "INV-2026-08", date: "1 Aug 2026", amount: 980, status: "open", seats: 20 },
  { id: "INV-2026-07", date: "1 Jul 2026", amount: 980, status: "paid", seats: 20 },
  { id: "INV-2026-06", date: "1 Jun 2026", amount: 833, status: "paid", seats: 17 },
  { id: "INV-2026-05", date: "1 May 2026", amount: 833, status: "paid", seats: 17 },
  { id: "INV-2026-04", date: "1 Apr 2026", amount: 686, status: "failed", seats: 14 },
  { id: "INV-2026-03", date: "1 Mar 2026", amount: 686, status: "paid", seats: 14 },
];

/** Builds an area path plus its line, in one pass. */
export function chartPaths(values: number[], w: number, h: number, pad = 6) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`;
  return { line, area, points };
}

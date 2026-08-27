/**
 * File tools — shared definitions and browser-side processing.
 *
 * Everything here runs in the visitor's browser. The site is a static export
 * with no server to upload to, which turns a constraint into the strongest
 * thing these tools have to say: the file never leaves the device.
 */

export type ToolSlug =
  | "image-convert"
  | "image-compress"
  | "images-to-pdf"
  | "pdf-to-images"
  | "pdf-to-text"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "pdf-page-numbers"
  | "pdf-watermark"
  | "pdf-remove-pages"
  | "favicon"
  | "palette"
  | "svg-to-png"
  | "ocr";

export type Tool = {
  slug: ToolSlug;
  name: string;
  blurb: string;
  /** Accept attribute for the picker. */
  accept: string;
  group: "Images" | "PDF" | "Design" | "Extract";
  /** Stated plainly on the tool page where there is a real limit. */
  caveat?: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "image-convert",
    name: "Convert images",
    blurb: "PNG, JPEG, WebP and AVIF, in any direction. Resize and set quality while you are there.",
    accept: "image/*",
    group: "Images",
  },
  {
    slug: "image-compress",
    name: "Compress images",
    blurb: "Cut file size with a quality dial and a live before-and-after on every file.",
    accept: "image/*",
    group: "Images",
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    blurb: "Combine photos or scans into one PDF, one image per page, in the order you choose.",
    accept: "image/png,image/jpeg,image/webp",
    group: "Images",
  },
  {
    slug: "pdf-to-images",
    name: "PDF to images",
    blurb: "Render every page to PNG or JPEG at the resolution you pick.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDFs",
    blurb: "Join several PDFs into one, reordered however you like before you export.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    blurb: "Pull out a page range, or break a document into single-page files.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    blurb: "Turn every page, or just the ones you name, in 90-degree steps.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "pdf-remove-pages",
    name: "Remove PDF pages",
    blurb: "Delete the pages you do not want and keep the rest in order.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "pdf-page-numbers",
    name: "Add page numbers",
    blurb: "Stamp numbers onto a PDF, positioned and sized how you like.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "pdf-watermark",
    name: "Watermark PDF",
    blurb: "Lay DRAFT, CONFIDENTIAL or your own text across every page.",
    accept: "application/pdf",
    group: "PDF",
  },
  {
    slug: "favicon",
    name: "Favicon generator",
    blurb: "One image in, a full icon set out — including a real multi-size favicon.ico.",
    accept: "image/*",
    group: "Design",
  },
  {
    slug: "palette",
    name: "Colour palette",
    blurb: "Pull the dominant colours out of any image and copy them as hex.",
    accept: "image/*",
    group: "Design",
  },
  {
    slug: "svg-to-png",
    name: "SVG to PNG",
    blurb: "Rasterise an SVG at any width, on transparent or white.",
    accept: "image/svg+xml",
    group: "Design",
    caveat:
      "The SVG is rendered by the browser, so anything it pulls from another domain — a remote font or image — will not appear.",
  },
  {
    slug: "pdf-to-text",
    name: "PDF to text",
    blurb: "Extract the real text layer from a PDF and download it as .txt or .doc.",
    accept: "application/pdf",
    group: "Extract",
    caveat:
      "This reads the text layer a PDF already carries. A scanned page has no text layer — use the OCR tool for those.",
  },
  {
    slug: "ocr",
    name: "OCR — scanned to text",
    blurb: "Read text off a scan or photo, in the browser, using Tesseract.",
    accept: "image/*,application/pdf",
    group: "Extract",
    caveat:
      "The recogniser is around 15MB and downloads the first time you run it. Accuracy depends on the scan — clean, straight, high-contrast pages do best.",
  },
];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);

export const IMAGE_FORMATS = [
  { id: "image/png", label: "PNG", ext: "png", lossy: false },
  { id: "image/jpeg", label: "JPEG", ext: "jpg", lossy: true },
  { id: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { id: "image/avif", label: "AVIF", ext: "avif", lossy: true },
] as const;

export type FormatId = (typeof IMAGE_FORMATS)[number]["id"];

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function swapExtension(name: string, ext: string) {
  return `${name.replace(/\.[^./\\]+$/, "")}.${ext}`;
}

/** Not every browser can *encode* every format; decoding says nothing about it. */
export async function canEncode(type: string) {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.5));
  return Boolean(blob && blob.type === type);
}

/**
 * Decodes with createImageBitmap where available — it decodes off the main
 * thread, so a 40MP photo does not freeze the page the way an <img> would.
 */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* falls through to the <img> path below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("That file could not be read as an image."));
      img.src = url;
    });
  } finally {
    // Revoked on the next tick so the decode has definitely finished with it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export type ConvertOptions = {
  type: FormatId;
  quality: number;
  /** Longest edge in pixels; 0 leaves the image at its original size. */
  maxEdge: number;
  /** Centre-crop to this exact square, for icon generation. */
  square?: number;
};

export async function convertImage(file: File, opts: ConvertOptions) {
  const source = await decode(file);
  const sw = source.width;
  const sh = source.height;

  let w = sw;
  let h = sh;
  if (opts.maxEdge > 0 && Math.max(sw, sh) > opts.maxEdge) {
    const scale = opts.maxEdge / Math.max(sw, sh);
    w = Math.round(sw * scale);
    h = Math.round(sh * scale);
  }

  // Icons must be exactly square, so the source is centre-cropped to its
  // shortest edge first rather than squashed to fit.
  const square = opts.square ?? 0;
  if (square > 0) {
    w = square;
    h = square;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  // PNG carries transparency and JPEG does not; without this a transparent
  // background encodes to black rather than white.
  if (opts.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";

  if (square > 0) {
    const edge = Math.min(sw, sh);
    ctx.drawImage(source as CanvasImageSource, (sw - edge) / 2, (sh - edge) / 2, edge, edge, 0, 0, w, h);
  } else {
    ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  }
  if ("close" in source) source.close();

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, opts.type, opts.quality));
  if (!blob) throw new Error(`This browser cannot write ${opts.type}.`);
  return { blob, width: w, height: h, sourceWidth: sw, sourceHeight: sh };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The pdf.js worker is copied into public/ by scripts/copy-pdf-worker.mjs. */
export function pdfWorkerSrc() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/pdf.worker.min.mjs`;
}

/** Parses "1-3, 7, 10-12" into zero-based indices, bounded by the page count. */
export function parsePageRange(input: string, total: number) {
  const out = new Set<number>();
  for (const part of input.split(",")) {
    const chunk = part.trim();
    if (!chunk) continue;
    const m = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
        if (i >= 1 && i <= total) out.add(i - 1);
      }
    } else if (/^\d+$/.test(chunk)) {
      const i = Number(chunk);
      if (i >= 1 && i <= total) out.add(i - 1);
    } else {
      throw new Error(`"${chunk}" is not a page or a range.`);
    }
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * Packs PNGs into a real multi-resolution .ico.
 *
 * The format is a 6-byte header, one 16-byte directory entry per image, then
 * the payloads. Modern browsers accept PNG inside ICO, so the images go in
 * untouched — no BMP conversion needed. A dimension of 0 means 256.
 */
export async function buildIco(pngs: Blob[]) {
  const buffers = await Promise.all(pngs.map((b) => b.arrayBuffer()));
  const header = 6;
  const dir = 16 * buffers.length;
  const total = header + dir + buffers.reduce((n, b) => n + b.byteLength, 0);
  const out = new ArrayBuffer(total);
  const view = new DataView(out);
  const bytes = new Uint8Array(out);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // 1 = icon
  view.setUint16(4, buffers.length, true);

  let offset = header + dir;
  buffers.forEach((buf, i) => {
    const entry = header + i * 16;
    // PNG stores its dimensions big-endian at byte 16.
    const png = new DataView(buf);
    const w = png.getUint32(16);
    const h = png.getUint32(20);
    bytes[entry] = w >= 256 ? 0 : w;
    bytes[entry + 1] = h >= 256 ? 0 : h;
    bytes[entry + 2] = 0; // palette size
    bytes[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, buf.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    bytes.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  });

  return new Blob([out], { type: "image/x-icon" });
}

/**
 * Dominant colours, by bucketing pixels into a coarse RGB grid and counting.
 *
 * A full k-means would be more accurate and far slower; for pulling a usable
 * palette off a photograph the difference is not visible. The image is sampled
 * at reduced size for the same reason.
 */
export async function extractPalette(file: File, want = 8) {
  const source = await decode(file);
  const scale = Math.min(1, 160 / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
  if ("close" in source) source.close();

  const { data } = ctx.getImageData(0, 0, w, h);
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  const STEP = 24; // bucket width per channel

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent pixels
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.round(r / STEP)}-${Math.round(g / STEP)}-${Math.round(b / STEP)}`;
    const hit = buckets.get(key);
    if (hit) {
      hit.r += r;
      hit.g += g;
      hit.b += b;
      hit.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }

  const counted = [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, want);
  const totalPixels = counted.reduce((n, c) => n + c.n, 0) || 1;
  const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0");

  return counted.map((c) => ({
    hex: `#${hex(c.r / c.n)}${hex(c.g / c.n)}${hex(c.b / c.n)}`,
    share: c.n / totalPixels,
  }));
}

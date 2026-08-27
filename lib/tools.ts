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
  | "ocr";

export type Tool = {
  slug: ToolSlug;
  name: string;
  blurb: string;
  /** Accept attribute for the picker. */
  accept: string;
  group: "Images" | "PDF" | "Extract";
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
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h);
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

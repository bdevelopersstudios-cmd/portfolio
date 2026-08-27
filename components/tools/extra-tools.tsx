"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Dropzone, ErrorNote, ToolButton } from "./dropzone";
import { Stagger, StatusArea, stagStep } from "./ui";
import { buildIco, convertImage, downloadBlob, extractPalette, formatBytes } from "@/lib/tools";

/* ------------------------------------------------------------ favicon set */

const ICON_SIZES = [
  { px: 16, name: "favicon-16x16.png", note: "Browser tab" },
  { px: 32, name: "favicon-32x32.png", note: "Tab, retina" },
  { px: 48, name: "favicon-48x48.png", note: "Windows" },
  { px: 180, name: "apple-touch-icon.png", note: "iOS home screen" },
  { px: 192, name: "android-chrome-192x192.png", note: "Android" },
  { px: 512, name: "android-chrome-512x512.png", note: "PWA splash" },
];

const HTML_SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

export function FaviconTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [icons, setIcons] = useState<{ name: string; url: string; blob: Blob; px: number; note: string }[]>([]);
  const [ico, setIco] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setIcons([]);
    setIco(null);
    setProgress(0);
    try {
      const made: typeof icons = [];
      for (let i = 0; i < ICON_SIZES.length; i++) {
        const spec = ICON_SIZES[i];
        const { blob } = await convertImage(files[0], {
          type: "image/png",
          quality: 1,
          maxEdge: spec.px,
          square: spec.px,
        });
        made.push({ name: spec.name, url: URL.createObjectURL(blob), blob, px: spec.px, note: spec.note });
        setProgress((i + 1) / (ICON_SIZES.length + 1));
        await new Promise((r) => setTimeout(r, 0));
      }
      // A real multi-resolution .ico, not a renamed PNG — 16/32/48 in one
      // container, which is what a browser actually asks /favicon.ico for.
      const icoBlob = await buildIco(made.filter((m) => m.px <= 48).map((m) => m.blob));
      setIcons(made);
      setIco(icoBlob);
      setProgress(1);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the icon set.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone
        accept="image/*"
        multiple={false}
        files={files}
        onFiles={setFiles}
        hint="A square image works best — anything else is centre-cropped."
      />

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Generating…" : "Generate icon set"}
        </ToolButton>
      </div>

      <StatusArea busy={busy} value={progress} label="Rendering sizes" done={done} doneLabel={`${ICON_SIZES.length} icons plus favicon.ico ready.`} />
      <ErrorNote>{error}</ErrorNote>

      {icons.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">Your icon set</h2>
            <ToolButton
              onClick={() => {
                if (ico) downloadBlob(ico, "favicon.ico");
                icons.forEach((i, n) => setTimeout(() => downloadBlob(i.blob, i.name), n * 120));
              }}
            >
              Download all
            </ToolButton>
          </div>

          <Stagger className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ico && (
              <motion.button
                variants={stagStep}
                type="button"
                onClick={() => downloadBlob(ico, "favicon.ico")}
                className="flex items-center gap-3 rounded-xl border border-line bg-bg-raised p-4 text-left transition-colors hover:border-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icons[1]?.url ?? icons[0].url} alt="" className="h-8 w-8 shrink-0 rounded" />
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[11px]">favicon.ico</span>
                  <span className="block text-[11px] text-ink-faint">16+32+48 · {formatBytes(ico.size)}</span>
                </span>
              </motion.button>
            )}
            {icons.map((i) => (
              <motion.button
                key={i.name}
                variants={stagStep}
                type="button"
                onClick={() => downloadBlob(i.blob, i.name)}
                className="flex items-center gap-3 rounded-xl border border-line bg-bg-raised p-4 text-left transition-colors hover:border-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.url} alt="" className="h-8 w-8 shrink-0 rounded object-contain" />
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[11px]">{i.name}</span>
                  <span className="block text-[11px] text-ink-faint">{i.note}</span>
                </span>
              </motion.button>
            ))}
          </Stagger>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
                Paste into your &lt;head&gt;
              </h3>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(HTML_SNIPPET);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="text-xs text-accent underline"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-line bg-bg-raised p-4 font-mono text-[12px] leading-relaxed text-ink-dim">
              {HTML_SNIPPET}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- palette */

export function PaletteTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [colors, setColors] = useState<{ hex: string; share: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setColors([]);
    try {
      const found = await extractPalette(files[0], 8);
      setColors(found);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
    } finally {
      setBusy(false);
    }
  };

  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <>
      <Dropzone accept="image/*" multiple={false} files={files} onFiles={setFiles} />

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Reading…" : "Extract palette"}
        </ToolButton>
      </div>

      <StatusArea busy={busy} value={0.6} label="Sampling pixels" done={done} doneLabel={`${colors.length} colours found.`} />
      <ErrorNote>{error}</ErrorNote>

      {colors.length > 0 && (
        <>
          <Stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colors.map((c) => (
              <motion.button
                key={c.hex}
                variants={stagStep}
                type="button"
                onClick={() => copy(c.hex)}
                className="overflow-hidden rounded-xl border border-line text-left transition-transform hover:-translate-y-0.5"
              >
                <span className="block h-20 w-full" style={{ background: c.hex }} />
                <span className="block px-3 py-2.5">
                  <span className="block font-mono text-[12px] uppercase">{copied === c.hex ? "Copied" : c.hex}</span>
                  <span className="block text-[11px] text-ink-faint">{Math.round(c.share * 100)}% of pixels</span>
                </span>
              </motion.button>
            ))}
          </Stagger>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => copy(colors.map((c) => c.hex).join(", "))}
              className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim"
            >
              Copy all as CSS
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------- SVG → PNG */

export function SvgToPng() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(1024);
  const [transparent, setTransparent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; blob: Blob; size: string } | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setPreview(null);
    try {
      const svgText = await files[0].text();
      // Rasterised through an <img> with a blob URL. A data: URL breaks on any
      // SVG containing a `#` in a colour or an id, which is most of them.
      const blobUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("That SVG could not be rendered — it may reference external assets."));
        el.src = blobUrl;
      });

      // An SVG with only a viewBox has no intrinsic size in some browsers.
      const ratio = img.height && img.width ? img.height / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round(width * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");
      if (!transparent) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);

      const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!out) throw new Error("Could not encode the PNG.");
      setPreview({ url: URL.createObjectURL(out), blob: out, size: `${canvas.width}×${canvas.height}` });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert that SVG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="image/svg+xml" multiple={false} files={files} onFiles={setFiles} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Output width</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[512, 1024, 2048, 4096].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWidth(w)}
                aria-pressed={width === w}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  width === w ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Background</span>
          <div className="mt-2.5 flex gap-2">
            {[
              [true, "Transparent"],
              [false, "White"],
            ].map(([v, label]) => (
              <button
                key={String(label)}
                type="button"
                onClick={() => setTransparent(v as boolean)}
                aria-pressed={transparent === v}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  transparent === v ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Rendering…" : "Convert to PNG"}
        </ToolButton>
      </div>

      <StatusArea busy={busy} value={0.6} label="Rasterising" done={done} doneLabel={preview ? `Rendered at ${preview.size}.` : "Done."} />
      <ErrorNote>{error}</ErrorNote>

      {preview && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">
              {preview.size} · {formatBytes(preview.blob.size)}
            </h2>
            <ToolButton
              onClick={() => downloadBlob(preview.blob, files[0].name.replace(/\.svg$/i, "") + ".png")}
            >
              Download PNG
            </ToolButton>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="Rendered result"
            className="dot-grid mt-4 w-full rounded-xl border border-line"
          />
        </motion.div>
      )}
    </>
  );
}

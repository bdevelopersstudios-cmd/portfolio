"use client";

import { useState } from "react";
import { Dropzone, ErrorNote, ToolButton } from "./dropzone";
import { Stagger, StatusArea, stagStep } from "./ui";
import { motion } from "motion/react";
import { downloadBlob, formatBytes, pdfWorkerSrc, swapExtension } from "@/lib/tools";

/**
 * pdf-lib and pdf.js are both imported dynamically. Together they are over a
 * megabyte, and nobody visiting the portfolio should pay for that in the
 * initial bundle — the cost lands only when a tool is actually used.
 */
async function loadPdfLib() {
  return import("pdf-lib");
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc();
  return pdfjs;
}

/* --------------------------------------------------------- images to PDF */

export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setFiles(next);
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setProgress(0);
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = new Uint8Array(await file.arrayBuffer());
        // pdf-lib embeds PNG and JPEG only, so anything else is re-encoded to
        // JPEG through a canvas first.
        let image;
        if (file.type === "image/png") {
          image = await doc.embedPng(bytes);
        } else if (file.type === "image/jpeg") {
          image = await doc.embedJpg(bytes);
        } else {
          const { convertImage } = await import("@/lib/tools");
          const { blob } = await convertImage(file, { type: "image/jpeg", quality: 0.92, maxEdge: 0 });
          image = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        }
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        setProgress((i + 1) / files.length);
        await new Promise((r) => setTimeout(r, 0));
      }

      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "images.pdf");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone
        accept="image/png,image/jpeg,image/webp"
        files={[]}
        onFiles={(f) => setFiles([...files, ...f])}
        hint="One image per page, in the order below."
      />

      {files.length > 0 && (
        <ol className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-xs text-ink-faint">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="text-xs text-ink-dim disabled:opacity-30" aria-label={`Move ${f.name} up`}>
                ↑
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === files.length - 1} className="text-xs text-ink-dim disabled:opacity-30" aria-label={`Move ${f.name} down`}>
                ↓
              </button>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-xs text-ink-dim underline" aria-label={`Remove ${f.name}`}>
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Building…" : `Create PDF (${files.length} page${files.length === 1 ? "" : "s"})`}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={progress} label="Adding pages" done={done} doneLabel="PDF downloaded." />
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

/* --------------------------------------------------------- PDF to images */

export function PdfToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [scale, setScale] = useState(2);
  const [type, setType] = useState<"image/png" | "image/jpeg">("image/png");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<{ name: string; url: string; blob: Blob }[]>([]);

  const run = async () => {
    setBusy(true);
    setError(null);
    setPages([]);
    setProgress(0);
    try {
      const pdfjs = await loadPdfJs();
      const file = files[0];
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const out: { name: string; url: string; blob: Blob }[] = [];

      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas is unavailable in this browser.");
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.92));
        if (blob) {
          out.push({
            name: `${file.name.replace(/\.pdf$/i, "")}-p${n}.${type === "image/png" ? "png" : "jpg"}`,
            url: URL.createObjectURL(blob),
            blob,
          });
        }
        setProgress(n / doc.numPages);
        await new Promise((r) => setTimeout(r, 0));
      }
      setPages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={setFiles} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Resolution</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[
              [1, "72 dpi"],
              [2, "144 dpi"],
              [3, "216 dpi"],
              [4, "288 dpi"],
            ].map(([v, label]) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setScale(v as number)}
                aria-pressed={scale === v}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
                  scale === v ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Format</span>
          <div className="mt-2.5 flex gap-2">
            {(["image/png", "image/jpeg"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
                  type === t ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {t === "image/png" ? "PNG" : "JPEG"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Rendering…" : "Render pages"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={progress} label="Rendering pages" done={pages.length > 0} doneLabel={`${pages.length} pages rendered.`} />
      <ErrorNote>{error}</ErrorNote>

      {pages.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">{pages.length} pages</h2>
            <ToolButton onClick={() => pages.forEach((p) => downloadBlob(p.blob, p.name))}>
              Download all
            </ToolButton>
          </div>
          <Stagger className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pages.map((p) => (
              <motion.button
                key={p.name}
                variants={stagStep}
                type="button"
                onClick={() => downloadBlob(p.blob, p.name)}
                className="group text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full rounded-lg border border-line transition-opacity group-hover:opacity-80"
                />
                <span className="mt-1.5 block truncate font-mono text-[11px] text-ink-faint">{p.name}</span>
              </motion.button>
            ))}
          </Stagger>
        </div>
      )}
    </>
  );
}

/* ----------------------------------------------------------- PDF to text */

export function PdfToText() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    setText("");
    setEmpty(false);
    setProgress(0);
    try {
      const pdfjs = await loadPdfJs();
      const file = files[0];
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const chunks: string[] = [];

      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const content = await page.getTextContent();
        const line = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        chunks.push(`--- Page ${n} ---\n${line}`);
        setProgress(n / doc.numPages);
        await new Promise((r) => setTimeout(r, 0));
      }

      const joined = chunks.join("\n\n");
      setText(joined);
      // A scan has pages but no text layer; say so rather than handing back
      // an empty box that looks like a failure.
      setEmpty(joined.replace(/--- Page \d+ ---/g, "").trim().length === 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that PDF.");
    } finally {
      setBusy(false);
    }
  };

  const name = files[0]?.name ?? "extract";

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={setFiles} />

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Reading…" : "Extract text"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={progress} label="Reading pages" done={Boolean(text)} doneLabel="Text extracted." />
      <ErrorNote>{error}</ErrorNote>

      {empty && (
        <ErrorNote>
          This PDF has no text layer — it is almost certainly a scan. Run it through the OCR tool instead.
        </ErrorNote>
      )}

      {text && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">
              {text.length.toLocaleString()} characters
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(text)}
                className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => downloadBlob(new Blob([text], { type: "text/plain" }), swapExtension(name, "txt"))}
                className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim"
              >
                .txt
              </button>
              <ToolButton
                onClick={() => {
                  // A Word-readable HTML document. Word opens this natively and
                  // it keeps paragraphs — which is all a text layer can honestly
                  // give you. It is not a layout-faithful .docx.
                  const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${text
                    .split("\n\n")
                    .map((p) => `<p>${p.replace(/[<>&]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]!))}</p>`)
                    .join("")}</body></html>`;
                  downloadBlob(new Blob([html], { type: "application/msword" }), swapExtension(name, "doc"));
                }}
              >
                Word (.doc)
              </ToolButton>
            </div>
          </div>
          <textarea
            readOnly
            value={text}
            rows={16}
            className="mt-4 w-full resize-y rounded-xl border border-line bg-bg-raised p-4 font-mono text-[13px] leading-relaxed"
          />
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------- merge PDF */

export function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setFiles(next);
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (const file of files) {
        const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "merged.pdf");
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — an encrypted or password-protected PDF cannot be merged.`
          : "Could not merge those PDFs."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" files={[]} onFiles={(f) => setFiles([...files, ...f])} />

      {files.length > 0 && (
        <ol className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-xs text-ink-faint">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
              <span className="shrink-0 font-mono text-xs text-ink-faint">{formatBytes(f.size)}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="text-xs text-ink-dim disabled:opacity-30" aria-label={`Move ${f.name} up`}>↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === files.length - 1} className="text-xs text-ink-dim disabled:opacity-30" aria-label={`Move ${f.name} down`}>↓</button>
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-xs text-ink-dim underline" aria-label={`Remove ${f.name}`}>Remove</button>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length < 2 || busy}>
          {busy ? "Merging…" : `Merge ${files.length || ""} PDFs`}
        </ToolButton>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

/* ------------------------------------------------------------- split PDF */

export function SplitPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readCount = async (list: File[]) => {
    setFiles(list);
    setCount(null);
    setError(null);
    if (list.length === 0) return;
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.load(new Uint8Array(await list[0].arrayBuffer()));
      setCount(doc.getPageCount());
    } catch {
      setError("That file could not be opened — it may be encrypted.");
    }
  };

  /** Parses "1-3, 7, 10-12" into zero-based indices, bounded by the page count. */
  const parseRange = (input: string, total: number) => {
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
  };

  const extract = async () => {
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const indices = parseRange(range, src.getPageCount());
      if (indices.length === 0) throw new Error("That range does not select any pages.");
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), swapExtension(files[0].name, "extract.pdf"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not split that PDF.");
    } finally {
      setBusy(false);
    }
  };

  const explode = async () => {
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const base = files[0].name.replace(/\.pdf$/i, "");
      for (let i = 0; i < src.getPageCount(); i++) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        const bytes = await out.save();
        downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${base}-p${i + 1}.pdf`);
        await new Promise((r) => setTimeout(r, 120));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not split that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={readCount} />

      {count !== null && (
        <p className="mt-4 text-sm text-ink-dim">
          {count} page{count === 1 ? "" : "s"} in this document.
        </p>
      )}

      <label className="mt-6 block max-w-sm">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
          Pages to extract
        </span>
        <input
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="e.g. 1-3, 7, 10-12"
          className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none"
        />
      </label>

      <div className="mt-7 flex flex-wrap gap-3">
        <ToolButton onClick={extract} disabled={files.length === 0 || !range.trim() || busy}>
          {busy ? "Working…" : "Extract range"}
        </ToolButton>
        <button
          type="button"
          onClick={explode}
          disabled={files.length === 0 || busy}
          className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim disabled:opacity-40"
        >
          Split into single pages
        </button>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

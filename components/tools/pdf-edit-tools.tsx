"use client";

import { useState } from "react";
import { Dropzone, ErrorNote, ToolButton } from "./dropzone";
import { StatusArea } from "./ui";
import { downloadBlob, parsePageRange, swapExtension } from "@/lib/tools";

async function loadPdfLib() {
  return import("pdf-lib");
}

/** Every tool here follows the same shape: pick a PDF, read its page count. */
function usePdfFile() {
  const [files, setFiles] = useState<File[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const take = async (list: File[]) => {
    setFiles(list);
    setCount(null);
    setError(null);
    if (list.length === 0) return;
    try {
      const { PDFDocument } = await loadPdfLib();
      const doc = await PDFDocument.load(new Uint8Array(await list[0].arrayBuffer()));
      setCount(doc.getPageCount());
    } catch {
      setError("That file could not be opened — it may be encrypted or damaged.");
    }
  };

  return { files, count, error, setError, take };
}

function PageCount({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <p className="mt-4 text-sm text-ink-dim">
      {count} page{count === 1 ? "" : "s"} in this document.
    </p>
  );
}

/* ----------------------------------------------------------- rotate pages */

const ANGLES = [90, 180, 270] as const;

export function RotatePdf() {
  const { files, count, error, setError, take } = usePdfFile();
  const [angle, setAngle] = useState<(typeof ANGLES)[number]>(90);
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const doc = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const pages = doc.getPages();
      const targets = range.trim()
        ? parsePageRange(range, pages.length)
        : pages.map((_, i) => i);
      if (targets.length === 0) throw new Error("That range does not select any pages.");

      for (const i of targets) {
        // Added to whatever rotation the page already carries, so a page that
        // was already sideways ends up where the user expects.
        const current = pages[i].getRotation().angle;
        pages[i].setRotation(degrees((current + angle) % 360));
      }
      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), swapExtension(files[0].name, "rotated.pdf"));
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rotate that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={take} />
      <PageCount count={count} />

      <div className="mt-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Turn by</span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {ANGLES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAngle(a)}
              aria-pressed={angle === a}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                angle === a ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
              }`}
            >
              <span aria-hidden="true" style={{ display: "inline-block", transform: `rotate(${a}deg)` }}>
                ⌐
              </span>
              {a}°
            </button>
          ))}
        </div>
      </div>

      <label className="mt-6 block max-w-sm">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
          Pages — blank turns them all
        </span>
        <input
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="e.g. 2, 5-8"
          className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Turning…" : "Rotate pages"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={0.6} label="Rewriting the document" done={done} doneLabel="Rotated PDF downloaded." />
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

/* ------------------------------------------------------------ page numbers */

const POSITIONS = [
  { id: "bottom-center", label: "Bottom centre" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "top-right", label: "Top right" },
] as const;

export function PdfPageNumbers() {
  const { files, count, error, setError, take } = usePdfFile();
  const [position, setPosition] = useState<(typeof POSITIONS)[number]["id"]>("bottom-center");
  const [start, setStart] = useState(1);
  const [size, setSize] = useState(11);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setProgress(0);
    try {
      const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
      const doc = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      pages.forEach((page, i) => {
        const label = String(start + i);
        const { width } = page.getSize();
        const textWidth = font.widthOfTextAtSize(label, size);
        const margin = 32;
        const x =
          position === "bottom-center"
            ? width / 2 - textWidth / 2
            : width - margin - textWidth;
        const y = position === "top-right" ? page.getSize().height - margin : margin;

        page.drawText(label, { x, y, size, font, color: rgb(0.35, 0.35, 0.35) });
        setProgress((i + 1) / pages.length);
      });

      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), swapExtension(files[0].name, "numbered.pdf"));
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not number that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={take} />
      <PageCount count={count} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Position</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPosition(p.id)}
                aria-pressed={position === p.id}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  position === p.id ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Start at</span>
            <input
              type="number"
              min={0}
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Size</span>
            <input
              type="number"
              min={6}
              max={36}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Numbering…" : "Add page numbers"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={progress} label="Numbering pages" done={done} doneLabel="Numbered PDF downloaded." />
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

/* --------------------------------------------------------------- watermark */

export function PdfWatermark() {
  const { files, count, error, setError, take } = usePdfFile();
  const [text, setText] = useState("DRAFT");
  const [opacity, setOpacity] = useState(0.16);
  const [diagonal, setDiagonal] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    setProgress(0);
    try {
      const { PDFDocument, StandardFonts, degrees, rgb } = await loadPdfLib();
      const doc = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        // Sized to the page so the mark reads the same on A4 and on a slide.
        const size = diagonal ? Math.min(width, height) / (text.length * 0.42 + 2) : width / (text.length * 0.62 + 2);
        const textWidth = font.widthOfTextAtSize(text, size);

        page.drawText(text, {
          x: diagonal ? width / 2 - (textWidth / 2) * 0.72 : width / 2 - textWidth / 2,
          y: diagonal ? height / 2 - size * 0.7 : height / 2 - size / 2,
          size,
          font,
          color: rgb(0.1, 0.1, 0.1),
          opacity,
          rotate: diagonal ? degrees(38) : degrees(0),
        });
        setProgress((i + 1) / pages.length);
      });

      const out = await doc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), swapExtension(files[0].name, "watermarked.pdf"));
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not watermark that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={take} />
      <PageCount count={count} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Watermark text</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={28}
            className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            Opacity — {Math.round(opacity * 100)}%
          </span>
          <input
            type="range"
            min={4}
            max={60}
            value={opacity * 100}
            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
            className="mt-4 w-full accent-accent"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          [true, "Diagonal"],
          [false, "Horizontal"],
        ].map(([v, label]) => (
          <button
            key={String(label)}
            type="button"
            onClick={() => setDiagonal(v as boolean)}
            aria-pressed={diagonal === v}
            className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              diagonal === v ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
            }`}
          >
            {label as string}
          </button>
        ))}
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || !text.trim() || busy}>
          {busy ? "Stamping…" : "Add watermark"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={progress} label="Stamping pages" done={done} doneLabel="Watermarked PDF downloaded." />
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

/* ------------------------------------------------------------ remove pages */

export function PdfRemovePages() {
  const { files, count, error, setError, take } = usePdfFile();
  const [range, setRange] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const total = src.getPageCount();
      const drop = new Set(parsePageRange(range, total));
      if (drop.size === 0) throw new Error("That range does not select any pages.");
      if (drop.size === total) throw new Error("That would remove every page.");

      const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !drop.has(i));
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, keep);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        swapExtension(files[0].name, "trimmed.pdf")
      );
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not edit that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="application/pdf" multiple={false} files={files} onFiles={take} />
      <PageCount count={count} />

      <label className="mt-6 block max-w-sm">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Pages to remove</span>
        <input
          value={range}
          onChange={(e) => setRange(e.target.value)}
          placeholder="e.g. 1, 4-6"
          className="mt-2 w-full rounded-lg border border-line bg-bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || !range.trim() || busy}>
          {busy ? "Removing…" : "Remove pages"}
        </ToolButton>
      </div>
      <StatusArea busy={busy} value={0.6} label="Rebuilding the document" done={done} doneLabel="Trimmed PDF downloaded." />
      <ErrorNote>{error}</ErrorNote>
    </>
  );
}

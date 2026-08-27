"use client";

import { useEffect, useState } from "react";
import { Dropzone, ErrorNote, ToolButton } from "./dropzone";
import { StatusArea } from "./ui";
import { motion } from "motion/react";
import {
  canEncode,
  convertImage,
  downloadBlob,
  formatBytes,
  IMAGE_FORMATS,
  swapExtension,
  type FormatId,
} from "@/lib/tools";
import { track } from "@/components/analytics";

type Result = {
  name: string;
  blob: Blob;
  before: number;
  after: number;
  dims: string;
};

function ResultList({ results }: { results: Result[] }) {
  if (results.length === 0) return null;
  const before = results.reduce((n, r) => n + r.before, 0);
  const after = results.reduce((n, r) => n + r.after, 0);
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl">
          {results.length} file{results.length === 1 ? "" : "s"} ready
        </h2>
        <ToolButton onClick={() => results.forEach((r) => downloadBlob(r.blob, r.name))}>
          Download all
        </ToolButton>
      </div>

      <p className="mt-2 text-sm text-ink-dim">
        {formatBytes(before)} → <span className="text-ink">{formatBytes(after)}</span>{" "}
        {saved > 0 ? `· ${saved}% smaller` : saved < 0 ? `· ${Math.abs(saved)}% larger` : ""}
      </p>

      <ul className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
        {results.map((r, i) => (
          <motion.li
            key={r.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
            <span className="font-mono text-xs text-ink-faint">{r.dims}</span>
            <span className="font-mono text-xs text-ink-faint">
              {formatBytes(r.before)} → {formatBytes(r.after)}
            </span>
            <button
              type="button"
              onClick={() => downloadBlob(r.blob, r.name)}
              className="text-xs text-accent underline"
            >
              Download
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Shared engine — the two image tools differ only in which controls they show. */
function ImageEngine({ mode }: { mode: "convert" | "compress" }) {
  const [files, setFiles] = useState<File[]>([]);
  const [type, setType] = useState<FormatId>(mode === "compress" ? "image/webp" : "image/png");
  const [quality, setQuality] = useState(mode === "compress" ? 0.7 : 0.92);
  const [maxEdge, setMaxEdge] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<Record<string, boolean>>({});

  // Encoder support varies by browser and cannot be inferred from the format
  // list, so each one is probed once and unsupported options are disabled.
  useEffect(() => {
    let live = true;
    Promise.all(IMAGE_FORMATS.map(async (f) => [f.id, await canEncode(f.id)] as const)).then(
      (pairs) => {
        if (live) setSupported(Object.fromEntries(pairs));
      }
    );
    return () => {
      live = false;
    };
  }, []);

  const lossy = IMAGE_FORMATS.find((f) => f.id === type)?.lossy ?? false;

  const run = async () => {
    setBusy(true);
    setError(null);
    setResults([]);
    setProgress(0);
    const out: Result[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = IMAGE_FORMATS.find((f) => f.id === type)?.ext ?? "png";
        const { blob, width, height } = await convertImage(file, { type, quality, maxEdge });
        out.push({
          name: swapExtension(file.name, ext),
          blob,
          before: file.size,
          after: blob.size,
          dims: `${width}×${height}`,
        });
        setProgress((i + 1) / files.length);
        // Yields between files so the progress bar actually paints.
        await new Promise((r) => setTimeout(r, 0));
      }
      setResults(out);
      track("tool_run", { tool: mode === "compress" ? "image-compress" : "image-convert", files: out.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong converting that file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropzone accept="image/*" files={files} onFiles={setFiles} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            Output format
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {IMAGE_FORMATS.map((f) => {
              const ok = supported[f.id] !== false;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={!ok}
                  onClick={() => setType(f.id)}
                  aria-pressed={type === f.id}
                  title={ok ? undefined : "This browser cannot write that format"}
                  className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors disabled:opacity-35 ${
                    type === f.id ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
              Quality — {Math.round(quality * 100)}%
            </span>
            <input
              type="range"
              min={10}
              max={100}
              value={quality * 100}
              disabled={!lossy}
              onChange={(e) => setQuality(Number(e.target.value) / 100)}
              className="mt-3 w-full accent-accent disabled:opacity-35"
            />
          </label>
          {!lossy && (
            <p className="mt-1.5 text-xs text-ink-faint">PNG is lossless — quality does not apply.</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
            Resize longest edge
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[0, 640, 1280, 1920, 2560].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMaxEdge(v)}
                aria-pressed={maxEdge === v}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  maxEdge === v ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
                }`}
              >
                {v === 0 ? "Original" : `${v}px`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Working…" : mode === "compress" ? "Compress" : "Convert"}
        </ToolButton>
      </div>

      <StatusArea busy={busy} value={progress} label={`Processing ${files.length} file${files.length === 1 ? "" : "s"}`} done={results.length > 0} doneLabel={`${results.length} file${results.length === 1 ? "" : "s"} ready.`} />
      <ErrorNote>{error}</ErrorNote>
      <ResultList results={results} />
    </>
  );
}

export function ImageConvert() {
  return <ImageEngine mode="convert" />;
}

export function ImageCompress() {
  return <ImageEngine mode="compress" />;
}

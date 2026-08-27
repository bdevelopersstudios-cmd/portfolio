"use client";

import { useState } from "react";
import { Dropzone, ErrorNote, ToolButton } from "./dropzone";
import { StatusArea } from "./ui";
import { downloadBlob, pdfWorkerSrc, swapExtension } from "@/lib/tools";

/**
 * OCR in the browser, via Tesseract's WebAssembly build.
 *
 * The recogniser and its language data are fetched on first run and cached by
 * the browser afterwards. That is a real cost to be upfront about, and it is
 * the trade for never sending someone's documents to a server.
 *
 * A PDF has no pixels to read directly, so pages are rendered to canvases with
 * pdf.js first and each one is recognised as an image.
 */

const LANGS = [
  { id: "eng", label: "English" },
  { id: "urd", label: "Urdu" },
  { id: "ara", label: "Arabic" },
  { id: "fra", label: "French" },
  { id: "deu", label: "German" },
  { id: "spa", label: "Spanish" },
];

async function pdfPagesToCanvases(file: File, onPage: (n: number, total: number) => void) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const canvases: HTMLCanvasElement[] = [];

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    // 2x scale: Tesseract's accuracy falls off badly below roughly 150 dpi,
    // and a PDF's default viewport is 72.
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    canvases.push(canvas);
    onPage(n, doc.numPages);
  }
  return canvases;
}

export function OcrTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setText("");
    setProgress(0);
    setStage("Loading the recogniser…");

    let worker: Awaited<ReturnType<typeof import("tesseract.js").createWorker>> | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setStage("Reading the page");
            setProgress(m.progress);
          } else {
            setStage(m.status.replace(/^\w/, (c) => c.toUpperCase()));
          }
        },
      });

      const file = files[0];
      const parts: string[] = [];

      if (file.type === "application/pdf") {
        setStage("Rendering PDF pages…");
        const canvases = await pdfPagesToCanvases(file, (n, total) =>
          setStage(`Rendering page ${n} of ${total}…`)
        );
        for (let i = 0; i < canvases.length; i++) {
          setStage(`Reading page ${i + 1} of ${canvases.length}`);
          const { data } = await worker.recognize(canvases[i]);
          parts.push(`--- Page ${i + 1} ---\n${data.text.trim()}`);
        }
      } else {
        const { data } = await worker.recognize(file);
        parts.push(data.text.trim());
      }

      const joined = parts.join("\n\n");
      setText(joined);
      if (joined.replace(/--- Page \d+ ---/g, "").trim().length === 0) {
        setError("Nothing legible was found. A straighter, higher-contrast scan usually helps.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR failed on that file.");
    } finally {
      // Always terminated: the worker holds a WASM heap that is not small.
      await worker?.terminate().catch(() => {});
      setBusy(false);
      setStage("");
    }
  };

  const name = files[0]?.name ?? "ocr";

  return (
    <>
      <Dropzone
        accept="image/*,application/pdf"
        multiple={false}
        files={files}
        onFiles={setFiles}
        hint="A photo, a scan, or a PDF. Processing happens in this tab."
      />

      <div className="mt-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">Language</span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              aria-pressed={lang === l.id}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                lang === l.id ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-dim"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <ToolButton onClick={run} disabled={files.length === 0 || busy}>
          {busy ? "Reading…" : "Extract text"}
        </ToolButton>
      </div>

      <StatusArea busy={busy} value={progress} label={stage || "Working"} detail={files[0]?.type === "application/pdf" ? "Multi-page scans take a moment per page" : undefined} done={Boolean(text)} doneLabel="Text recognised." />
      <ErrorNote>{error}</ErrorNote>

      {text && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">{text.length.toLocaleString()} characters</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(text)}
                className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ink-dim"
              >
                Copy
              </button>
              <ToolButton
                onClick={() =>
                  downloadBlob(new Blob([text], { type: "text/plain" }), swapExtension(name, "txt"))
                }
              >
                Download .txt
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

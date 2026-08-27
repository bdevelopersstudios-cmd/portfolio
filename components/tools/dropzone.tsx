"use client";

import { useCallback, useId, useRef, useState } from "react";
import { formatBytes } from "@/lib/tools";

/**
 * Shared file input. Click, drag-and-drop, and keyboard all reach the same
 * hidden <input type="file">, so the drop target is a real control rather than
 * a div that only a mouse can operate.
 */
export function Dropzone({
  accept,
  multiple = true,
  files,
  onFiles,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const id = useId();

  const accepts = useCallback(
    (file: File) => {
      const patterns = accept.split(",").map((s) => s.trim()).filter(Boolean);
      if (patterns.length === 0) return true;
      return patterns.some((p) =>
        p.endsWith("/*") ? file.type.startsWith(p.slice(0, -1)) : file.type === p
      );
    },
    [accept]
  );

  const take = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const next = Array.from(list).filter(accepts);
      if (next.length === 0) return;
      onFiles(multiple ? [...files, ...next] : next.slice(0, 1));
    },
    [accepts, files, multiple, onFiles]
  );

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          take(e.target.files);
          // Reset so picking the same file twice still fires a change event.
          e.target.value = "";
        }}
      />

      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          over ? "border-accent bg-accent/5" : "border-line hover:border-ink-faint"
        }`}
      >
        <span className="font-display text-lg">
          Drop {multiple ? "files" : "a file"} here, or click to choose
        </span>
        <span className="mt-2 text-sm text-ink-dim">
          {hint ?? "Nothing is uploaded — the work happens in this browser tab."}
        </span>
      </label>

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-line-soft rounded-xl border border-line">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
              <span className="shrink-0 font-mono text-xs text-ink-faint">{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => onFiles(files.filter((_, j) => j !== i))}
                className="shrink-0 text-xs text-ink-dim underline hover:text-accent"
                aria-label={`Remove ${f.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ToolButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="mt-6" role="status" aria-live="polite">
      <div className="flex justify-between text-xs text-ink-dim">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200"
          style={{ width: `${Math.max(2, value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-4 rounded-xl border border-line bg-bg-raised px-4 py-3 text-sm text-ink-dim">
      {children}
    </p>
  );
}

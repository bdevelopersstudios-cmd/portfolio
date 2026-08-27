"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GREETING, NO_MATCH, OPENERS, findAnswer, offTopicReply, type Answer } from "@/lib/assistant";
import { track } from "@/components/analytics";
import { LLM_TIMEOUT_MS, askLlm, llmEnabled } from "@/lib/assistant-llm";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  links?: Answer["links"];
  followUps?: string[];
};

/** Renders the **bold** spans the answers use, without pulling in a markdown parser. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: GREETING, followUps: OPENERS },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [misses, setMisses] = useState(0);

  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const reduced = useReducedMotion();

  // Pin to the newest message whenever the transcript grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  // Focus is delayed past the panel's entrance so it does not fight the animation.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 260);
    return () => window.clearTimeout(t);
  }, [open]);

  // Escape closes from anywhere, which is the expected behaviour for a
  // floating panel and the only way out for a keyboard user mid-typing.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || thinking) return;

      const history = messages.slice(-6).map((m) => ({ from: m.from, text: m.text }));
      setMessages((prev) => [...prev, { id: nextId.current++, from: "user", text: question }]);
      setInput("");
      setThinking(true);

      // The built-in answer is resolved first and always: it is exact on the
      // questions that matter most (rates, availability, what is for sale) and
      // it is the fallback if the model is unreachable.
      const local = findAnswer(question);

      let reply: string | null = null;
      let source: "llm" | "local" | "none" = "none";

      if (llmEnabled()) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
        reply = await askLlm(question, history, controller.signal);
        window.clearTimeout(timer);
        if (reply) source = "llm";
      }

      if (!reply && local) {
        reply = local.answer.reply;
        source = "local";
      }

      track("assistant_question", { source, matched: local ? local.answer.id : "none" });

      // A short beat before replying. An instant answer reads as a lookup
      // table; this reads as an answer. Skipped when the model already took
      // real time to respond.
      const pause = source === "llm" || reduced ? 0 : 380 + Math.random() * 240;
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          reply
            ? {
                id: nextId.current++,
                from: "bot",
                text: reply,
                links: local?.answer.links,
                followUps: local?.answer.followUps,
              }
            : {
                id: nextId.current++,
                from: "bot",
                text: misses === 0 ? NO_MATCH : offTopicReply(misses - 1),
                followUps: OPENERS.slice(0, 3),
              },
        ]);
        setMisses((m) => (reply ? 0 : m + 1));
        setThinking(false);
      }, pause);
    },
    [messages, misses, reduced, thinking]
  );

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-cursor-hover
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close the assistant" : "Ask about Usman's work"}
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 220, damping: 18 }}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg shadow-accent/25 sm:bottom-7 sm:right-7"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-xl leading-none">
              ×
            </motion.span>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 1 1-3.2-6.4M8.5 11h.01M12 11h.01M15.5 11h.01" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Assistant"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[70] flex max-h-[min(34rem,calc(100dvh-8rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl sm:right-7 sm:w-[26rem]"
          >
            <header className="flex items-center gap-3 border-b border-line-soft px-5 py-4">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] leading-tight">Ask about Usman&apos;s work</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  Services, templates, tools and background
                </p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26 }}
                  className={m.from === "user" ? "flex justify-end" : ""}
                >
                  <div
                    className={
                      m.from === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-[14px] text-accent-ink"
                        : "max-w-[92%] text-[14px] leading-relaxed text-ink-dim"
                    }
                  >
                    <p data-assistant-text>
                      <RichText text={m.text} />
                    </p>

                    {m.links && m.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.links.map((l) => (
                          <Link
                            key={l.href + l.label}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-accent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-ink transition-opacity hover:opacity-90"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {m.followUps && m.followUps.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.followUps.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => send(q)}
                            className="rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-dim transition-colors hover:border-accent hover:text-accent"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                      animate={reduced ? undefined : { y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line-soft px-4 py-3"
            >
              <label htmlFor={`${panelId}-input`} className="sr-only">
                Your question
              </label>
              <input
                id={`${panelId}-input`}
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 text-[14px] outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-opacity disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

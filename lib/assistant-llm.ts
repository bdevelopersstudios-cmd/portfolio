/**
 * LLM client for the assistant.
 *
 * SET THIS after deploying worker/chat-worker.js — see worker/README.md. It is
 * the Worker's URL, never an API key: a key here would ship in the browser
 * bundle for anyone to read and spend.
 *
 * Leave it empty and the assistant runs on its built-in answers alone, which
 * is a working product rather than a broken one.
 */
export const CHAT_ENDPOINT = "";

export const llmEnabled = () => CHAT_ENDPOINT.length > 0;

export type HistoryTurn = { from: "bot" | "user"; text: string };

/**
 * Asks the Worker. Returns null on any failure — no endpoint, network error,
 * bad status, empty reply — so the caller can fall back to the local answers
 * rather than showing an error to a prospective client.
 */
export async function askLlm(
  question: string,
  history: HistoryTurn[],
  signal?: AbortSignal
): Promise<string | null> {
  if (!llmEnabled()) return null;

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
      signal,
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const reply =
      typeof data === "object" && data !== null && "reply" in data
        ? String((data as { reply: unknown }).reply ?? "")
        : "";
    return reply.trim() || null;
  } catch {
    return null;
  }
}

/** Ten seconds, after which the local answer is better than a spinner. */
export const LLM_TIMEOUT_MS = 10_000;

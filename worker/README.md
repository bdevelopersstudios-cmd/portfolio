# Assistant backend

A Cloudflare Worker that holds the LLM API key so the browser never sees it.

## Why not call the model directly from the site?

The site is a static export. Anything it needs at runtime ships in the
JavaScript bundle, where `view-source` will show it to anyone. A leaked key
gets scraped and used within days — first exhausting the free tier, then
billing you if a card is attached.

This Worker is the smallest thing that keeps the key server-side. Cloudflare's
free plan allows 100,000 requests a day.

## Deploy

```bash
npm install -g wrangler
wrangler login

cd worker
wrangler deploy
wrangler secret put GEMINI_API_KEY   # paste the key when prompted
```

Get a free Gemini key at <https://aistudio.google.com/apikey> — no card
required. To use Groq instead, set `GROQ_API_KEY` and the Worker will pick
that up instead.

Then copy the deployed URL into `CHAT_ENDPOINT` in `lib/assistant-llm.ts`.

## Until you deploy it

Nothing breaks. The assistant falls back to its built-in answers, which cover
the common questions exactly and cost nothing to run.

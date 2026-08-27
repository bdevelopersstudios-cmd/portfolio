/**
 * pdf.js runs its parser in a web worker loaded from a URL at runtime, so the
 * file has to exist as a real static asset rather than something the bundler
 * inlines. Copying it on every build keeps it in step with the installed
 * pdfjs-dist version — a stale worker fails with a confusing version mismatch.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkg = require.resolve("pdfjs-dist/package.json");
const src = join(dirname(pkg), "build", "pdf.worker.min.mjs");
const dest = join(process.cwd(), "public", "pdf.worker.min.mjs");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`pdf worker → ${dest}`);

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored, minified, and copied in on every build by
    // scripts/copy-pdf-worker.mjs — not ours to lint.
    "public/pdf.worker.min.mjs",
    // Cloudflare Worker — a different runtime with its own conventions, and
    // not part of the Next build.
    "worker/**",
  ]),
]);

export default eslintConfig;

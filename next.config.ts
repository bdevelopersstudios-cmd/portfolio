import type { NextConfig } from "next";

const basePath = "/portfolio";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Exposed to the client so the PDF worker — which is copied into public/ by
  // the `copy-pdf-worker` script and therefore served from the base path — can
  // be located at runtime without hardcoding the prefix in a component.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

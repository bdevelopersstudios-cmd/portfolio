import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/tools";
import { templates } from "@/lib/templates";

export const dynamic = "force-static";

const SITE = "https://bdevelopersstudios-cmd.github.io/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    // The tools are the pages most likely to be found by search — each one
    // answers a query somebody is actively typing — so they are listed
    // individually rather than left behind the index.
    { url: `${SITE}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...TOOLS.map((tool) => ({
      url: `${SITE}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...templates.map((t) => ({
      url: `${SITE}${t.previewPath}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

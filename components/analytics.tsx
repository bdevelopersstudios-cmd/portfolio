import Script from "next/script";

/**
 * Privacy-first analytics.
 *
 * Cookieless and GDPR-clean by design, which matters here beyond principle:
 * this site's whole pitch on /tools is that files never leave your device, and
 * loading a tracker that follows people across the web would contradict it on
 * the same page.
 *
 * Nothing renders until you set the site id below — I cannot create the
 * account for you. Both options are configured; pick one.
 *
 *   Plausible (plausible.io, ~$9/mo, hosted)
 *     1. Add your domain as a site
 *     2. Put that exact domain in PLAUSIBLE_DOMAIN
 *
 *   Umami (umami.is — free cloud tier, or self-host)
 *     1. Add a website, copy its Website ID
 *     2. Put it in UMAMI_WEBSITE_ID, and the script host in UMAMI_SRC
 *
 * Note: both count real visits only. Your own visits are included, so use the
 * exclusion setting in whichever you choose or your numbers will flatter you.
 */

const PLAUSIBLE_DOMAIN = "";
const UMAMI_WEBSITE_ID = "";
const UMAMI_SRC = "https://cloud.umami.is/script.js";

export function Analytics() {
  if (PLAUSIBLE_DOMAIN) {
    return (
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (UMAMI_WEBSITE_ID) {
    return (
      <Script defer data-website-id={UMAMI_WEBSITE_ID} src={UMAMI_SRC} strategy="afterInteractive" />
    );
  }

  return null;
}

/**
 * Fires a custom event, if analytics is on. Safe to call regardless — with no
 * provider configured it is a no-op, so call sites need no guard of their own.
 *
 * Used for the things worth knowing: which tool someone actually ran, and
 * which service they enquired about.
 */
export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  const w = window as typeof window & {
    plausible?: (e: string, o?: { props?: Record<string, string | number> }) => void;
    umami?: { track: (e: string, d?: Record<string, string | number>) => void };
  };

  try {
    w.plausible?.(event, props ? { props } : undefined);
    w.umami?.track(event, props);
  } catch {
    // Analytics must never break a tool. Swallow and carry on.
  }
}

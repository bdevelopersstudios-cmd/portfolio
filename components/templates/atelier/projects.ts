/**
 * Project data, deliberately outside the "use client" shell: generateStaticParams
 * runs on the server at build time, and importing from a client module hands it
 * a client reference proxy instead of the array.
 */

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  discipline: "Brand" | "Digital" | "Print";
  note: string;
  scope: string[];
  summary: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "sable",
    title: "Sable & Co",
    client: "Sable",
    year: "2026",
    discipline: "Brand",
    note: "Identity, packaging and a 96-page standards manual for a third-wave roaster.",
    scope: ["Identity", "Packaging", "Standards manual", "Signage"],
    summary:
      "Sable had grown from one cart to eleven cafés without a system holding it together. Every location had drifted — different cup, different sign, different green. We rebuilt the identity around a single drawn mark and a palette taken from roast levels rather than fashion, then wrote it all down so the next eleven do not drift.",
  },
  {
    slug: "marginalia",
    title: "Marginalia",
    client: "Verso Press",
    year: "2026",
    discipline: "Print",
    note: "A quarterly literary journal, typeset in Freight with a two-colour spot system.",
    scope: ["Editorial design", "Typesetting", "Cover art direction"],
    summary:
      "A journal that had been typeset in Word for nine years. We built a grid that survives a 900-word poem and a 12,000-word essay in the same issue, and a two-colour spot system that keeps the print bill flat while every issue still looks different.",
  },
  {
    slug: "northbound",
    title: "Northbound",
    client: "Northbound Rail",
    year: "2025",
    discipline: "Digital",
    note: "Wayfinding and a booking flow that survived a 40-station rollout.",
    scope: ["Wayfinding", "Product design", "Design system"],
    summary:
      "Forty stations, three languages, and a booking flow with a 41% drop-off at seat selection. We rebuilt the flow around the two decisions people actually make and left the rest as defaults. Drop-off fell to 12% over the following quarter.",
  },
  {
    slug: "ferrous",
    title: "Ferrous",
    client: "Ferrous Tools",
    year: "2025",
    discipline: "Brand",
    note: "A workshop brand built to be stamped, etched and screen-printed.",
    scope: ["Identity", "Applied marks", "Catalogue"],
    summary:
      "Most identities are drawn for screens and then apologised for everywhere else. This one started at the die-stamp: a mark that reads at 4mm pressed into steel, and scales up without becoming a different logo.",
  },
  {
    slug: "halcyon",
    title: "Halcyon",
    client: "Halcyon Studio",
    year: "2024",
    discipline: "Digital",
    note: "Portfolio and CMS for a photography studio shooting on medium format.",
    scope: ["Art direction", "Web design", "CMS build"],
    summary:
      "A photography site where the photographs are 80MP and the audience is often on hotel wifi. The whole design problem was sequencing: what loads first, what waits, and how to make waiting feel intentional rather than broken.",
  },
  {
    slug: "pressfold",
    title: "Pressfold",
    client: "Pressfold",
    year: "2024",
    discipline: "Print",
    note: "A monograph series with a French-fold cover and exposed binding.",
    scope: ["Series design", "Production", "Print liaison"],
    summary:
      "Six monographs that had to sit together on a shelf and apart on a table. One trim size, one binding, and a cover system where only the colour and one drawn element change between titles.",
  },
];

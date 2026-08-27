import type { Metadata } from "next";
import { Atelier } from "@/components/templates/atelier";
import { PreviewBar } from "@/components/templates/preview-bar";

export const metadata: Metadata = {
  title: "Atelier — studio site template",
  description: "Live preview of Atelier, an editorial studio site with kinetic type and a filterable index.",
};

export default function AtelierPreview() {
  return (
    <>
      <Atelier />
      <PreviewBar name="Atelier" price={1000} />
    </>
  );
}

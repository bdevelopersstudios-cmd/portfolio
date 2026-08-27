import type { Metadata } from "next";
import { Nimbus } from "@/components/templates/nimbus";
import { PreviewBar } from "@/components/templates/preview-bar";

export const metadata: Metadata = {
  title: "Nimbus — SaaS landing template",
  description: "Live preview of Nimbus, a bento-grid SaaS launch page with working pricing logic.",
};

export default function NimbusPreview() {
  return (
    <>
      <Nimbus />
      <PreviewBar name="Nimbus" price={1000} />
    </>
  );
}

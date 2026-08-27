import type { Metadata } from "next";
import { Console } from "@/components/templates/console";
import { PreviewBar } from "@/components/templates/preview-bar";

export const metadata: Metadata = {
  title: "Console — dashboard template",
  description: "Live preview of Console, an analytics dashboard with a sortable table and an SVG chart.",
};

export default function ConsolePreview() {
  return (
    <>
      <Console />
      <PreviewBar name="Console" price={1000} />
    </>
  );
}

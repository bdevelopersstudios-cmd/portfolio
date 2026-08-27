import type { Metadata } from "next";
import { Docs } from "@/components/templates/nimbus/marketing";

export const metadata: Metadata = { title: "Nimbus — Docs" };

export default function Page() {
  return <Docs />;
}

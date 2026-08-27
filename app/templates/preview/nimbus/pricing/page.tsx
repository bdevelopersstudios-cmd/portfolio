import type { Metadata } from "next";
import { Pricing } from "@/components/templates/nimbus/marketing";

export const metadata: Metadata = { title: "Nimbus — Pricing" };

export default function Page() {
  return <Pricing />;
}

import type { Metadata } from "next";
import { Work } from "@/components/templates/atelier/screens";

export const metadata: Metadata = { title: "Atelier — Work" };

export default function Page() {
  return <Work />;
}

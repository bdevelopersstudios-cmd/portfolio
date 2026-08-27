import type { Metadata } from "next";
import { Studio } from "@/components/templates/atelier/screens";

export const metadata: Metadata = { title: "Atelier — Studio" };

export default function Page() {
  return <Studio />;
}

import type { Metadata } from "next";
import { Contact } from "@/components/templates/atelier/screens";

export const metadata: Metadata = { title: "Atelier — Contact" };

export default function Page() {
  return <Contact />;
}
